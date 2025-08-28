import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { PaginationDto, PaginatedResult, PaginationMeta } from '../common/dto/pagination.dto';
import { Reservation, ReservationStatus, UserStatus } from '@prisma/client';
import { BooksService } from '../books/books.service';
import { UsersService } from '../users/users.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ReservationsService {
  constructor(
    private prisma: PrismaService,
    private booksService: BooksService,
    private usersService: UsersService,
    private configService: ConfigService,
  ) {}

  async create(createReservationDto: CreateReservationDto): Promise<Reservation> {
    const { userId, bookId } = createReservationDto;

    // Check if user exists and is active
    const user = await this.usersService.findOne(userId);
    if (user.status !== UserStatus.ACTIVE) {
      throw new BadRequestException('User is not active and cannot make reservations');
    }

    // Check if book exists
    const book = await this.booksService.findOne(bookId);

    // Check if user already has an active reservation for this book
    const existingReservation = await this.prisma.reservation.findFirst({
      where: {
        userId,
        bookId,
        status: ReservationStatus.ACTIVE,
      },
    });

    if (existingReservation) {
      throw new ConflictException('User already has an active reservation for this book');
    }

    // Check if user already has an active loan for this book
    const existingLoan = await this.prisma.loan.findFirst({
      where: {
        userId,
        bookId,
        status: {
          in: ['ACTIVE', 'OVERDUE'],
        },
      },
    });

    if (existingLoan) {
      throw new ConflictException('User already has an active loan for this book');
    }

    // Check reservation limits based on user type
    const activeReservationCount = await this.prisma.reservation.count({
      where: {
        userId,
        status: ReservationStatus.ACTIVE,
      },
    });

    const maxReservations = this.getMaxReservationsForUserType(user.userType);
    if (activeReservationCount >= maxReservations) {
      throw new ConflictException(`User has reached the maximum reservation limit of ${maxReservations} books`);
    }

    // Calculate expiry date
    const reservationDurationDays = this.configService.get<number>('RESERVATION_DURATION_DAYS', 7);
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + reservationDurationDays);

    // Determine initial status based on book availability
    const status = book.availableCopies > 0 ? ReservationStatus.FULFILLED : ReservationStatus.ACTIVE;

    return this.prisma.reservation.create({
      data: {
        userId,
        bookId,
        expirationDate: expiryDate,
        status,
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

  async findAll(paginationDto: PaginationDto): Promise<PaginatedResult<Reservation>> {
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

    const [reservations, total] = await Promise.all([
      this.prisma.reservation.findMany({
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
      this.prisma.reservation.count({ where }),
    ]);

    const meta = new PaginationMeta(total, page, limit);

    return {
      data: reservations,
      meta,
    };
  }

  async findOne(id: number): Promise<Reservation> {
    const reservation = await this.prisma.reservation.findUnique({
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
            availableCopies: true,
          },
        },
      },
    });

    if (!reservation) {
      throw new NotFoundException(`Reservation with ID ${id} not found`);
    }

    return reservation;
  }

  async update(id: number, updateReservationDto: UpdateReservationDto): Promise<Reservation> {
    const reservation = await this.findOne(id);

    // Extract only the fields that can be updated
    const { status, fulfilledAt, cancelledAt } = updateReservationDto;
    const updateData: any = {};
    
    if (status !== undefined) updateData.status = status;
    if (fulfilledAt !== undefined) updateData.fulfilledAt = new Date(fulfilledAt);
    if (cancelledAt !== undefined) updateData.cancelledAt = new Date(cancelledAt);

    return this.prisma.reservation.update({
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

  async cancel(id: number): Promise<Reservation> {
    const reservation = await this.findOne(id);

    if (reservation.status === ReservationStatus.CANCELLED) {
      throw new ConflictException('Reservation has already been cancelled');
    }

    if (reservation.status === ReservationStatus.FULFILLED) {
      throw new BadRequestException('Cannot cancel a fulfilled reservation');
    }

    return this.prisma.reservation.update({
      where: { id },
      data: {
        status: ReservationStatus.CANCELLED,
        // cancelledAt field doesn't exist in schema
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

  async fulfill(id: number): Promise<Reservation> {
    const reservation = await this.findOne(id);

    if (reservation.status !== ReservationStatus.ACTIVE) {
      throw new BadRequestException('Only active reservations can be fulfilled');
    }

    return this.prisma.reservation.update({
      where: { id },
      data: { status: ReservationStatus.FULFILLED },
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

  async findByUser(userId: number, paginationDto: PaginationDto): Promise<PaginatedResult<Reservation>> {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = paginationDto;
    const skip = (page - 1) * limit;

    const orderBy = { [sortBy]: sortOrder };

    const [reservations, total] = await Promise.all([
      this.prisma.reservation.findMany({
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
              availableCopies: true,
            },
          },
        },
      }),
      this.prisma.reservation.count({ where: { userId } }),
    ]);

    const totalPages = Math.ceil(total / limit);

    const meta = new PaginationMeta(total, page, limit);

    return {
      data: reservations,
      meta,
    };
  }

  async findExpiredReservations(): Promise<Reservation[]> {
    const currentDate = new Date();

    return this.prisma.reservation.findMany({
      where: {
        expirationDate: {
          lt: currentDate,
        },
        status: ReservationStatus.ACTIVE,
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

  async updateExpiredReservations(): Promise<{ updated: number }> {
    const currentDate = new Date();

    const result = await this.prisma.reservation.updateMany({
      where: {
        expirationDate: {
          lt: currentDate,
        },
        status: ReservationStatus.ACTIVE,
      },
      data: {
        status: ReservationStatus.EXPIRED,
      },
    });

    return { updated: result.count };
  }

  async updatePendingReservations(): Promise<{ updated: number }> {
    // Find books that have available copies and active reservations
    const booksWithAvailableCopies = await this.prisma.book.findMany({
      where: {
        availableCopies: {
          gt: 0,
        },
        reservations: {
          some: {
            status: ReservationStatus.ACTIVE,
          },
        },
      },
      include: {
          reservations: {
            where: {
              status: ReservationStatus.ACTIVE,
            },
            orderBy: {
              reservationDate: 'asc', // First come, first served
            },
          },
        },
    });

    let totalUpdated = 0;

    for (const book of booksWithAvailableCopies) {
      const reservationsToUpdate = book.reservations.slice(0, book.availableCopies);
      
      for (const reservation of reservationsToUpdate) {
        await this.prisma.reservation.update({
          where: { id: reservation.id },
          data: { status: ReservationStatus.FULFILLED },
        });
        totalUpdated++;
      }
    }

    return { updated: totalUpdated };
  }

  async getStatistics() {
    const [totalReservations, activeReservations, fulfilledReservations, cancelledReservations, expiredReservations] = await Promise.all([
      this.prisma.reservation.count(),
      this.prisma.reservation.count({ where: { status: ReservationStatus.ACTIVE } }),
      this.prisma.reservation.count({ where: { status: ReservationStatus.FULFILLED } }),
      this.prisma.reservation.count({ where: { status: ReservationStatus.CANCELLED } }),
      this.prisma.reservation.count({ where: { status: ReservationStatus.EXPIRED } }),
    ]);

    return {
      totalReservations,
      activeReservations,
      fulfilledReservations,
      cancelledReservations,
      expiredReservations,
    };
  }

  private getMaxReservationsForUserType(userType: string): number {
    switch (userType) {
      case 'STUDENT':
        return this.configService.get<number>('MAX_RESERVATIONS_STUDENT', 2);
      case 'TEACHER':
        return this.configService.get<number>('MAX_RESERVATIONS_TEACHER', 5);
      case 'PUBLIC':
        return this.configService.get<number>('MAX_RESERVATIONS_PUBLIC', 1);
      default:
        return 1;
    }
  }
}