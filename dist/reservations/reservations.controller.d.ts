import { ReservationsService } from './reservations.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
export declare class ReservationsController {
    private readonly reservationsService;
    constructor(reservationsService: ReservationsService);
    create(createReservationDto: CreateReservationDto): Promise<{
        status: import(".prisma/client").$Enums.ReservationStatus;
        id: number;
        userId: number;
        bookId: number;
        reservationDate: Date;
        expirationDate: Date;
        priority: number;
        notified: boolean;
    }>;
    findAll(paginationDto: PaginationDto): Promise<import("../common/dto/pagination.dto").PaginatedResult<{
        status: import(".prisma/client").$Enums.ReservationStatus;
        id: number;
        userId: number;
        bookId: number;
        reservationDate: Date;
        expirationDate: Date;
        priority: number;
        notified: boolean;
    }>>;
    findExpiredReservations(): Promise<{
        status: import(".prisma/client").$Enums.ReservationStatus;
        id: number;
        userId: number;
        bookId: number;
        reservationDate: Date;
        expirationDate: Date;
        priority: number;
        notified: boolean;
    }[]>;
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
    findByUser(userId: number, paginationDto: PaginationDto): Promise<import("../common/dto/pagination.dto").PaginatedResult<{
        status: import(".prisma/client").$Enums.ReservationStatus;
        id: number;
        userId: number;
        bookId: number;
        reservationDate: Date;
        expirationDate: Date;
        priority: number;
        notified: boolean;
    }>>;
    findOne(id: number): Promise<{
        status: import(".prisma/client").$Enums.ReservationStatus;
        id: number;
        userId: number;
        bookId: number;
        reservationDate: Date;
        expirationDate: Date;
        priority: number;
        notified: boolean;
    }>;
    update(id: number, updateReservationDto: UpdateReservationDto): Promise<{
        status: import(".prisma/client").$Enums.ReservationStatus;
        id: number;
        userId: number;
        bookId: number;
        reservationDate: Date;
        expirationDate: Date;
        priority: number;
        notified: boolean;
    }>;
    cancel(id: number): Promise<{
        status: import(".prisma/client").$Enums.ReservationStatus;
        id: number;
        userId: number;
        bookId: number;
        reservationDate: Date;
        expirationDate: Date;
        priority: number;
        notified: boolean;
    }>;
    fulfill(id: number): Promise<{
        status: import(".prisma/client").$Enums.ReservationStatus;
        id: number;
        userId: number;
        bookId: number;
        reservationDate: Date;
        expirationDate: Date;
        priority: number;
        notified: boolean;
    }>;
}
