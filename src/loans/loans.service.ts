import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLoanDto } from './dto/create-loan.dto';
import { UpdateLoanDto } from './dto/update-loan.dto';
import { PaginationDto, PaginatedResult, PaginationMeta } from '../common/dto/pagination.dto';
import { Loan, LoanStatus, UserStatus } from '@prisma/client';
import { BooksService } from '../books/books.service';
import { UsersService } from '../users/users.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class LoansService {
  constructor(
    private prisma: PrismaService,
    private booksService: BooksService,
    private usersService: UsersService,
    private configService: ConfigService,
  ) {}

  async create(createLoanDto: CreateLoanDto): Promise<Loan> {
    const { userId, bookId } = createLoanDto;

    // Check if user exists and is active
    const user = await this.usersService.findOne(userId);
    if (user.status !== UserStatus.ACTIVE) {
      throw new BadRequestException('User is not active and cannot borrow books');
    }

    // Check if book exists and is available
    const book = await this.booksService.findOne(bookId);
    if (book.availableCopies <= 0) {
      throw new ConflictException('Book is not available for loan');
    }

    // Check if user already has an active loan for this book
    const existingLoan = await this.prisma.loan.findFirst({
      where: {
        userId,
        bookId,
        status: {
          in: [LoanStatus.ACTIVE, LoanStatus.OVERDUE],
        },
      },
    });

    if (existingLoan) {
      throw new ConflictException('User already has an active loan for this book');
    }

    // Check loan limits based on user type
    const activeLoanCount = await this.prisma.loan.count({
      where: {
        userId,
        status: {
          in: [LoanStatus.ACTIVE, LoanStatus.OVERDUE],
        },
      },
    });

    const maxLoans = this.getMaxLoansForUserType(user.userType);
    if (activeLoanCount >= maxLoans) {
      throw new ConflictException(`User has reached the maximum loan limit of ${maxLoans} books`);
    }

    // Calculate due date
    const loanDurationDays = this.configService.get<number>('LOAN_DURATION_DAYS', 14);
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + loanDurationDays);

    // Create loan and update book availability in a transaction
    const result = await this.prisma.$transaction(async (tx) => {
      // Create the loan
      const loan = await tx.loan.create({
        data: {
          userId,
          bookId,
          dueDate,
          status: LoanStatus.ACTIVE,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              userType: true,
            },
          },
          book: {
            select: {
              id: true,
              title: true,
              author: true,
              isbn: true,
            },
          },
        },
      });

      // Update book available copies
      await this.booksService.updateAvailableCopies(bookId, -1);

      return loan;
    });

    return result;
  }

  async findAll(paginationDto: PaginationDto): Promise<PaginatedResult<Loan>> {
    const { page = 1, limit = 10, search, sortBy = 'createdAt', sortOrder = 'desc' } = paginationDto;
    const skip = (page - 1) * limit;

    const where = search
      ? {
          OR: [
            { user: { name: { contains: search, mode: 'insensitive' as const } } },
            { user: { email: { contains: search, mode: 'insensitive' as const } } },
            { book: { title: { contains: search, mode: 'insensitive' as const } } },
            { book: { author: { contains: search, mode: 'insensitive' as const } } },
            { book: { isbn: { contains: search, mode: 'insensitive' as const } } },
          ],
        }
      : {};

    const orderBy = { [sortBy]: sortOrder };

    const [loans, total] = await Promise.all([
      this.prisma.loan.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              userType: true,
            },
          },
          book: {
            select: {
              id: true,
              title: true,
              author: true,
              isbn: true,
            },
          },
        },
      }),
      this.prisma.loan.count({ where }),
    ]);

    const meta = new PaginationMeta(total, page, limit);

    return {
      data: loans,
      meta,
    };
  }

  async findOne(id: number): Promise<Loan> {
    const loan = await this.prisma.loan.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            userType: true,
            phone: true,
          },
        },
        book: {
          select: {
            id: true,
            title: true,
            author: true,
            isbn: true,
            genre: true,
            location: true,
          },
        },
      },
    });

    if (!loan) {
      throw new NotFoundException(`Loan with ID ${id} not found`);
    }

    return loan;
  }

  async update(id: number, updateLoanDto: UpdateLoanDto): Promise<Loan> {
    const loan = await this.findOne(id);

    const { returnDate, fineAmount, renewalCount } = updateLoanDto;
    const updateData = {
      ...(returnDate && { returnDate: new Date(returnDate) }),
      ...(renewalCount !== undefined && { renewalCount }),
      ...(fineAmount !== undefined && { fine: fineAmount }),
    };

    return this.prisma.loan.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            userType: true,
          },
        },
        book: {
          select: {
            id: true,
            title: true,
            author: true,
            isbn: true,
          },
        },
      },
    });
  }

  async returnBook(id: number): Promise<Loan> {
    const loan = await this.findOne(id);

    if (loan.status === LoanStatus.RETURNED) {
      throw new ConflictException('Book has already been returned');
    }

    if (loan.status !== LoanStatus.ACTIVE && loan.status !== LoanStatus.OVERDUE) {
      throw new BadRequestException('Only active or overdue loans can be returned');
    }

    const returnDate = new Date();
    const isOverdue = returnDate > loan.dueDate;

    // Calculate fine if overdue
    let fineAmount = 0;
    if (isOverdue) {
      const overdueDays = Math.ceil(
        (returnDate.getTime() - loan.dueDate.getTime()) / (1000 * 60 * 60 * 24),
      );
      const finePerDay = this.configService.get<number>('FINE_PER_DAY', 1.0);
      fineAmount = overdueDays * finePerDay;
    }

    // Return book and update availability in a transaction
    const result = await this.prisma.$transaction(async (tx) => {
      // Update loan status
      const updatedLoan = await tx.loan.update({
        where: { id },
        data: {
          status: LoanStatus.RETURNED,
          returnDate,
          fine: isOverdue ? fineAmount : undefined,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              userType: true,
            },
          },
          book: {
            select: {
              id: true,
              title: true,
              author: true,
              isbn: true,
            },
          },
        },
      });

      // Update book available copies
      await this.booksService.updateAvailableCopies(loan.bookId, 1);

      // Add fine to user if overdue
      if (isOverdue && fineAmount > 0) {
        await this.usersService.addFine(loan.userId, fineAmount);
      }

      return updatedLoan;
    });

    return result;
  }

  async renewLoan(id: number): Promise<Loan> {
    const loan = await this.findOne(id);

    if (loan.status !== LoanStatus.ACTIVE) {
      throw new BadRequestException('Only active loans can be renewed');
    }

    // Check if loan has already been renewed
    if (loan.renewalCount >= this.configService.get<number>('MAX_RENEWALS', 2)) {
      throw new ConflictException('Loan has reached maximum renewal limit');
    }

    // Check if there are pending reservations for this book
    const pendingReservations = await this.prisma.reservation.count({
      where: {
        bookId: loan.bookId,
        status: 'ACTIVE',
      },
    });

    if (pendingReservations > 0) {
      throw new ConflictException('Cannot renew loan as there are pending reservations for this book');
    }

    // Extend due date
    const loanDurationDays = this.configService.get<number>('LOAN_DURATION_DAYS', 14);
    const newDueDate = new Date(loan.dueDate);
    newDueDate.setDate(newDueDate.getDate() + loanDurationDays);

    return this.prisma.loan.update({
      where: { id },
      data: {
        dueDate: newDueDate,
        renewalCount: loan.renewalCount + 1,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            userType: true,
          },
        },
        book: {
          select: {
            id: true,
            title: true,
            author: true,
            isbn: true,
          },
        },
      },
    });
  }

  async findByUser(userId: number, paginationDto: PaginationDto): Promise<PaginatedResult<Loan>> {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = paginationDto;
    const skip = (page - 1) * limit;

    const orderBy = { [sortBy]: sortOrder };

    const [loans, total] = await Promise.all([
      this.prisma.loan.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy,
        include: {
          book: {
            select: {
              id: true,
              title: true,
              author: true,
              isbn: true,
              genre: true,
            },
          },
        },
      }),
      this.prisma.loan.count({ where: { userId } }),
    ]);

    const meta = new PaginationMeta(total, page, limit);

    return {
      data: loans,
      meta,
    };
  }

  async findOverdueLoans(): Promise<Loan[]> {
    const currentDate = new Date();

    return this.prisma.loan.findMany({
      where: {
        dueDate: {
          lt: currentDate,
        },
        status: LoanStatus.ACTIVE,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            userType: true,
          },
        },
        book: {
          select: {
            id: true,
            title: true,
            author: true,
            isbn: true,
          },
        },
      },
    });
  }

  async updateOverdueLoans(): Promise<{ updated: number }> {
    const currentDate = new Date();

    const result = await this.prisma.loan.updateMany({
      where: {
        dueDate: {
          lt: currentDate,
        },
        status: LoanStatus.ACTIVE,
      },
      data: {
        status: LoanStatus.OVERDUE,
      },
    });

    return { updated: result.count };
  }

  async getStatistics() {
    const [totalLoans, activeLoans, overdueLoans, returnedLoans, totalFines] = await Promise.all([
      this.prisma.loan.count(),
      this.prisma.loan.count({ where: { status: LoanStatus.ACTIVE } }),
      this.prisma.loan.count({ where: { status: LoanStatus.OVERDUE } }),
      this.prisma.loan.count({ where: { status: LoanStatus.RETURNED } }),
      this.prisma.loan.aggregate({
        _sum: {
          fine: true,
        },
        where: {
          fine: {
            gt: 0,
          },
        },
      }),
    ]);

    return {
      totalLoans,
      activeLoans,
      overdueLoans,
      returnedLoans,
      totalFines: totalFines._sum.fine || 0,
    };
  }

  private getMaxLoansForUserType(userType: string): number {
    switch (userType) {
      case 'STUDENT':
        return this.configService.get<number>('MAX_LOANS_STUDENT', 3);
      case 'TEACHER':
        return this.configService.get<number>('MAX_LOANS_TEACHER', 10);
      case 'PUBLIC':
        return this.configService.get<number>('MAX_LOANS_PUBLIC', 2);
      default:
        return 2;
    }
  }
}