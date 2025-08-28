import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { PaginationDto, PaginatedResult, PaginationMeta } from '../common/dto/pagination.dto';
import { Book, Prisma } from '@prisma/client';

@Injectable()
export class BooksService {
  constructor(private prisma: PrismaService) {}

  async create(createBookDto: CreateBookDto): Promise<Book> {
    try {
      // Check if ISBN already exists (if provided)
      if (createBookDto.isbn) {
        const existingBook = await this.prisma.book.findUnique({
          where: { isbn: createBookDto.isbn },
        });

        if (existingBook) {
          throw new ConflictException('Book with this ISBN already exists');
        }
      }

      // Validate business rules
      if (createBookDto.totalCopies < 1) {
        throw new BadRequestException('Total copies must be at least 1');
      }

      if (createBookDto.availableCopies > createBookDto.totalCopies) {
        throw new BadRequestException('Available copies cannot exceed total copies');
      }

      const book = await this.prisma.book.create({
        data: {
          ...createBookDto,
          availableCopies: createBookDto.availableCopies ?? createBookDto.totalCopies,
          addedDate: new Date(),
          lastUpdated: new Date(),
        },
      });

      return book;
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Book with this ISBN already exists');
      }
      throw error;
    }
  }

  async findAll(paginationDto: PaginationDto): Promise<PaginatedResult<Book>> {
    const { page, limit, search, sortBy, sortOrder } = paginationDto;
    const skip = (page - 1) * limit;

    // Build where clause for search
    const where: Prisma.BookWhereInput = search
      ? {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { author: { contains: search, mode: 'insensitive' } },
            { isbn: { contains: search, mode: 'insensitive' } },
            { genre: { contains: search, mode: 'insensitive' } },
            { publisher: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};

    // Build orderBy clause
    const orderBy: Prisma.BookOrderByWithRelationInput = sortBy
      ? { [sortBy]: sortOrder }
      : { addedDate: 'desc' };

    const [books, total] = await Promise.all([
      this.prisma.book.findMany({
        where,
        skip,
        take: limit,
        orderBy,
      }),
      this.prisma.book.count({ where }),
    ]);

    const meta = new PaginationMeta(total, page, limit);

    return {
      data: books,
      meta,
    };
  }

  async findOne(id: number): Promise<Book> {
    const book = await this.prisma.book.findUnique({
      where: { id },
      include: {
        loans: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                userType: true,
              },
            },
          },
          orderBy: { loanDate: 'desc' },
        },
        reservations: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                userType: true,
              },
            },
          },
          orderBy: { reservationDate: 'desc' },
        },
      },
    });

    if (!book) {
      throw new NotFoundException(`Book with ID ${id} not found`);
    }

    return book;
  }

  async findByIsbn(isbn: string): Promise<Book | null> {
    return this.prisma.book.findUnique({
      where: { isbn },
    });
  }

  async update(id: number, updateBookDto: UpdateBookDto): Promise<Book> {
    // Check if book exists
    const existingBook = await this.prisma.book.findUnique({
      where: { id },
    });

    if (!existingBook) {
      throw new NotFoundException(`Book with ID ${id} not found`);
    }

    // Check ISBN uniqueness if ISBN is being updated
    if (updateBookDto.isbn && updateBookDto.isbn !== existingBook.isbn) {
      const isbnExists = await this.prisma.book.findUnique({
        where: { isbn: updateBookDto.isbn },
      });

      if (isbnExists) {
        throw new ConflictException('Book with this ISBN already exists');
      }
    }

    // Validate business rules
    const totalCopies = updateBookDto.totalCopies ?? existingBook.totalCopies;
    const availableCopies = updateBookDto.availableCopies ?? existingBook.availableCopies;

    if (totalCopies < 1) {
      throw new BadRequestException('Total copies must be at least 1');
    }

    if (availableCopies > totalCopies) {
      throw new BadRequestException('Available copies cannot exceed total copies');
    }

    if (availableCopies < 0) {
      throw new BadRequestException('Available copies cannot be negative');
    }

    try {
      const updatedBook = await this.prisma.book.update({
        where: { id },
        data: {
          ...updateBookDto,
          lastUpdated: new Date(),
        },
      });

      return updatedBook;
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Book with this ISBN already exists');
      }
      throw error;
    }
  }

  async remove(id: number): Promise<{ message: string }> {
    // Check if book exists
    const book = await this.prisma.book.findUnique({
      where: { id },
      include: {
        loans: { where: { status: 'ACTIVE' } },
        reservations: { where: { status: 'ACTIVE' } },
      },
    });

    if (!book) {
      throw new NotFoundException(`Book with ID ${id} not found`);
    }

    // Check if book has active loans or reservations
    if (book.loans.length > 0) {
      throw new BadRequestException('Cannot delete book with active loans');
    }

    if (book.reservations.length > 0) {
      throw new BadRequestException('Cannot delete book with active reservations');
    }

    await this.prisma.book.delete({
      where: { id },
    });

    return { message: `Book with ID ${id} has been successfully deleted` };
  }

  async findAvailable(paginationDto: PaginationDto): Promise<PaginatedResult<Book>> {
    const { page, limit, search, sortBy, sortOrder } = paginationDto;
    const skip = (page - 1) * limit;

    // Build where clause for search and available books
    const where: Prisma.BookWhereInput = {
      availableCopies: { gt: 0 },
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { author: { contains: search, mode: 'insensitive' } },
          { isbn: { contains: search, mode: 'insensitive' } },
          { genre: { contains: search, mode: 'insensitive' } },
          { publisher: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    // Build orderBy clause
    const orderBy: Prisma.BookOrderByWithRelationInput = sortBy
      ? { [sortBy]: sortOrder }
      : { addedDate: 'desc' };

    const [books, total] = await Promise.all([
      this.prisma.book.findMany({
        where,
        skip,
        take: limit,
        orderBy,
      }),
      this.prisma.book.count({ where }),
    ]);

    const meta = new PaginationMeta(total, page, limit);

    return {
      data: books,
      meta,
    };
  }

  async findByGenre(genre: string, paginationDto: PaginationDto): Promise<PaginatedResult<Book>> {
    const { page, limit, search, sortBy, sortOrder } = paginationDto;
    const skip = (page - 1) * limit;

    // Build where clause for genre and optional search
    const where: Prisma.BookWhereInput = {
      genre: { contains: genre, mode: 'insensitive' },
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { author: { contains: search, mode: 'insensitive' } },
          { isbn: { contains: search, mode: 'insensitive' } },
          { publisher: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    // Build orderBy clause
    const orderBy: Prisma.BookOrderByWithRelationInput = sortBy
      ? { [sortBy]: sortOrder }
      : { addedDate: 'desc' };

    const [books, total] = await Promise.all([
      this.prisma.book.findMany({
        where,
        skip,
        take: limit,
        orderBy,
      }),
      this.prisma.book.count({ where }),
    ]);

    const meta = new PaginationMeta(total, page, limit);

    return {
      data: books,
      meta,
    };
  }

  async findPopular(limit: number = 10): Promise<Book[]> {
    // Find books with most loans (popular books)
    const popularBooks = await this.prisma.book.findMany({
      include: {
        _count: {
          select: {
            loans: true,
          },
        },
      },
      orderBy: {
        loans: {
          _count: 'desc',
        },
      },
      take: limit,
    });

    return popularBooks;
  }

  async getStatistics(): Promise<any> {
    const [totalBooks, availableBooks, totalLoans, activeLoans] = await Promise.all([
      this.prisma.book.count(),
      this.prisma.book.count({ where: { availableCopies: { gt: 0 } } }),
      this.prisma.loan.count(),
      this.prisma.loan.count({ where: { status: 'ACTIVE' } }),
    ]);

    return {
      totalBooks,
      availableBooks,
      unavailableBooks: totalBooks - availableBooks,
      totalLoans,
      activeLoans,
      returnedLoans: totalLoans - activeLoans,
    };
  }

  async updateAvailableCopies(id: number, change: number): Promise<Book> {
    const book = await this.prisma.book.findUnique({
      where: { id },
    });

    if (!book) {
      throw new NotFoundException(`Book with ID ${id} not found`);
    }

    const newAvailableCopies = book.availableCopies + change;

    if (newAvailableCopies < 0) {
      throw new BadRequestException('Available copies cannot be negative');
    }

    if (newAvailableCopies > book.totalCopies) {
      throw new BadRequestException('Available copies cannot exceed total copies');
    }

    return this.prisma.book.update({
      where: { id },
      data: {
        availableCopies: newAvailableCopies,
        lastUpdated: new Date(),
      },
    });
  }
}