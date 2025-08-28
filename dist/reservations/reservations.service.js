"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReservationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const pagination_dto_1 = require("../common/dto/pagination.dto");
const client_1 = require("@prisma/client");
const books_service_1 = require("../books/books.service");
const users_service_1 = require("../users/users.service");
const config_1 = require("@nestjs/config");
let ReservationsService = class ReservationsService {
    constructor(prisma, booksService, usersService, configService) {
        this.prisma = prisma;
        this.booksService = booksService;
        this.usersService = usersService;
        this.configService = configService;
    }
    async create(createReservationDto) {
        const { userId, bookId } = createReservationDto;
        const user = await this.usersService.findOne(userId);
        if (user.status !== client_1.UserStatus.ACTIVE) {
            throw new common_1.BadRequestException('User is not active and cannot make reservations');
        }
        const book = await this.booksService.findOne(bookId);
        const existingReservation = await this.prisma.reservation.findFirst({
            where: {
                userId,
                bookId,
                status: client_1.ReservationStatus.ACTIVE,
            },
        });
        if (existingReservation) {
            throw new common_1.ConflictException('User already has an active reservation for this book');
        }
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
            throw new common_1.ConflictException('User already has an active loan for this book');
        }
        const activeReservationCount = await this.prisma.reservation.count({
            where: {
                userId,
                status: client_1.ReservationStatus.ACTIVE,
            },
        });
        const maxReservations = this.getMaxReservationsForUserType(user.userType);
        if (activeReservationCount >= maxReservations) {
            throw new common_1.ConflictException(`User has reached the maximum reservation limit of ${maxReservations} books`);
        }
        const reservationDurationDays = this.configService.get('RESERVATION_DURATION_DAYS', 7);
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + reservationDurationDays);
        const status = book.availableCopies > 0 ? client_1.ReservationStatus.FULFILLED : client_1.ReservationStatus.ACTIVE;
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
    async findAll(paginationDto) {
        const { page = 1, limit = 10, search, sortBy = 'createdAt', sortOrder = 'desc' } = paginationDto;
        const skip = (page - 1) * limit;
        const where = search
            ? {
                OR: [
                    { user: { name: { contains: search, mode: 'insensitive' } } },
                    { user: { email: { contains: search, mode: 'insensitive' } } },
                    { book: { title: { contains: search, mode: 'insensitive' } } },
                    { book: { author: { contains: search, mode: 'insensitive' } } },
                    { book: { isbn: { contains: search, mode: 'insensitive' } } },
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
        const meta = new pagination_dto_1.PaginationMeta(total, page, limit);
        return {
            data: reservations,
            meta,
        };
    }
    async findOne(id) {
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
            throw new common_1.NotFoundException(`Reservation with ID ${id} not found`);
        }
        return reservation;
    }
    async update(id, updateReservationDto) {
        const reservation = await this.findOne(id);
        const { status, fulfilledAt, cancelledAt } = updateReservationDto;
        const updateData = {};
        if (status !== undefined)
            updateData.status = status;
        if (fulfilledAt !== undefined)
            updateData.fulfilledAt = new Date(fulfilledAt);
        if (cancelledAt !== undefined)
            updateData.cancelledAt = new Date(cancelledAt);
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
    async cancel(id) {
        const reservation = await this.findOne(id);
        if (reservation.status === client_1.ReservationStatus.CANCELLED) {
            throw new common_1.ConflictException('Reservation has already been cancelled');
        }
        if (reservation.status === client_1.ReservationStatus.FULFILLED) {
            throw new common_1.BadRequestException('Cannot cancel a fulfilled reservation');
        }
        return this.prisma.reservation.update({
            where: { id },
            data: {
                status: client_1.ReservationStatus.CANCELLED,
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
    async fulfill(id) {
        const reservation = await this.findOne(id);
        if (reservation.status !== client_1.ReservationStatus.ACTIVE) {
            throw new common_1.BadRequestException('Only active reservations can be fulfilled');
        }
        return this.prisma.reservation.update({
            where: { id },
            data: { status: client_1.ReservationStatus.FULFILLED },
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
    async findByUser(userId, paginationDto) {
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
        const meta = new pagination_dto_1.PaginationMeta(total, page, limit);
        return {
            data: reservations,
            meta,
        };
    }
    async findExpiredReservations() {
        const currentDate = new Date();
        return this.prisma.reservation.findMany({
            where: {
                expirationDate: {
                    lt: currentDate,
                },
                status: client_1.ReservationStatus.ACTIVE,
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
    async updateExpiredReservations() {
        const currentDate = new Date();
        const result = await this.prisma.reservation.updateMany({
            where: {
                expirationDate: {
                    lt: currentDate,
                },
                status: client_1.ReservationStatus.ACTIVE,
            },
            data: {
                status: client_1.ReservationStatus.EXPIRED,
            },
        });
        return { updated: result.count };
    }
    async updatePendingReservations() {
        const booksWithAvailableCopies = await this.prisma.book.findMany({
            where: {
                availableCopies: {
                    gt: 0,
                },
                reservations: {
                    some: {
                        status: client_1.ReservationStatus.ACTIVE,
                    },
                },
            },
            include: {
                reservations: {
                    where: {
                        status: client_1.ReservationStatus.ACTIVE,
                    },
                    orderBy: {
                        reservationDate: 'asc',
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
                    data: { status: client_1.ReservationStatus.FULFILLED },
                });
                totalUpdated++;
            }
        }
        return { updated: totalUpdated };
    }
    async getStatistics() {
        const [totalReservations, activeReservations, fulfilledReservations, cancelledReservations, expiredReservations] = await Promise.all([
            this.prisma.reservation.count(),
            this.prisma.reservation.count({ where: { status: client_1.ReservationStatus.ACTIVE } }),
            this.prisma.reservation.count({ where: { status: client_1.ReservationStatus.FULFILLED } }),
            this.prisma.reservation.count({ where: { status: client_1.ReservationStatus.CANCELLED } }),
            this.prisma.reservation.count({ where: { status: client_1.ReservationStatus.EXPIRED } }),
        ]);
        return {
            totalReservations,
            activeReservations,
            fulfilledReservations,
            cancelledReservations,
            expiredReservations,
        };
    }
    getMaxReservationsForUserType(userType) {
        switch (userType) {
            case 'STUDENT':
                return this.configService.get('MAX_RESERVATIONS_STUDENT', 2);
            case 'TEACHER':
                return this.configService.get('MAX_RESERVATIONS_TEACHER', 5);
            case 'PUBLIC':
                return this.configService.get('MAX_RESERVATIONS_PUBLIC', 1);
            default:
                return 1;
        }
    }
};
exports.ReservationsService = ReservationsService;
exports.ReservationsService = ReservationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        books_service_1.BooksService,
        users_service_1.UsersService,
        config_1.ConfigService])
], ReservationsService);
//# sourceMappingURL=reservations.service.js.map