import { PrismaService } from '../prisma/prisma.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { PaginationDto, PaginatedResult } from '../common/dto/pagination.dto';
import { Reservation } from '@prisma/client';
import { BooksService } from '../books/books.service';
import { UsersService } from '../users/users.service';
import { ConfigService } from '@nestjs/config';
export declare class ReservationsService {
    private prisma;
    private booksService;
    private usersService;
    private configService;
    constructor(prisma: PrismaService, booksService: BooksService, usersService: UsersService, configService: ConfigService);
    create(createReservationDto: CreateReservationDto): Promise<Reservation>;
    findAll(paginationDto: PaginationDto): Promise<PaginatedResult<Reservation>>;
    findOne(id: number): Promise<Reservation>;
    update(id: number, updateReservationDto: UpdateReservationDto): Promise<Reservation>;
    cancel(id: number): Promise<Reservation>;
    fulfill(id: number): Promise<Reservation>;
    findByUser(userId: number, paginationDto: PaginationDto): Promise<PaginatedResult<Reservation>>;
    findExpiredReservations(): Promise<Reservation[]>;
    updateExpiredReservations(): Promise<{
        updated: number;
    }>;
    updatePendingReservations(): Promise<{
        updated: number;
    }>;
    getStatistics(): Promise<{
        totalReservations: number;
        activeReservations: number;
        fulfilledReservations: number;
        cancelledReservations: number;
        expiredReservations: number;
    }>;
    private getMaxReservationsForUserType;
}
