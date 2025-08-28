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
exports.LoansService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const pagination_dto_1 = require("../common/dto/pagination.dto");
const client_1 = require("@prisma/client");
const books_service_1 = require("../books/books.service");
const users_service_1 = require("../users/users.service");
const config_1 = require("@nestjs/config");
let LoansService = class LoansService {
    constructor(prisma, booksService, usersService, configService) {
        this.prisma = prisma;
        this.booksService = booksService;
        this.usersService = usersService;
        this.configService = configService;
    }
    async create(createLoanDto) {
        const { userId, bookId } = createLoanDto;
        const user = await this.usersService.findOne(userId);
        if (user.status !== client_1.UserStatus.ACTIVE) {
            throw new common_1.BadRequestException('User is not active and cannot borrow books');
        }
        const book = await this.booksService.findOne(bookId);
        if (book.availableCopies <= 0) {
            throw new common_1.ConflictException('Book is not available for loan');
        }
        const existingLoan = await this.prisma.loan.findFirst({
            where: {
                userId,
                bookId,
                status: {
                    in: [client_1.LoanStatus.ACTIVE, client_1.LoanStatus.OVERDUE],
                },
            },
        });
        if (existingLoan) {
            throw new common_1.ConflictException('User already has an active loan for this book');
        }
        const activeLoanCount = await this.prisma.loan.count({
            where: {
                userId,
                status: {
                    in: [client_1.LoanStatus.ACTIVE, client_1.LoanStatus.OVERDUE],
                },
            },
        });
        const maxLoans = this.getMaxLoansForUserType(user.userType);
        if (activeLoanCount >= maxLoans) {
            throw new common_1.ConflictException(`User has reached the maximum loan limit of ${maxLoans} books`);
        }
        const loanDurationDays = this.configService.get('LOAN_DURATION_DAYS', 14);
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + loanDurationDays);
        const result = await this.prisma.$transaction(async (tx) => {
            const loan = await tx.loan.create({
                data: {
                    userId,
                    bookId,
                    dueDate,
                    status: client_1.LoanStatus.ACTIVE,
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
            await this.booksService.updateAvailableCopies(bookId, -1);
            return loan;
        });
        return result;
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
        const meta = new pagination_dto_1.PaginationMeta(total, page, limit);
        return {
            data: loans,
            meta,
        };
    }
    async findOne(id) {
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
            throw new common_1.NotFoundException(`Loan with ID ${id} not found`);
        }
        return loan;
    }
    async update(id, updateLoanDto) {
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
    async returnBook(id) {
        const loan = await this.findOne(id);
        if (loan.status === client_1.LoanStatus.RETURNED) {
            throw new common_1.ConflictException('Book has already been returned');
        }
        if (loan.status !== client_1.LoanStatus.ACTIVE && loan.status !== client_1.LoanStatus.OVERDUE) {
            throw new common_1.BadRequestException('Only active or overdue loans can be returned');
        }
        const returnDate = new Date();
        const isOverdue = returnDate > loan.dueDate;
        let fineAmount = 0;
        if (isOverdue) {
            const overdueDays = Math.ceil((returnDate.getTime() - loan.dueDate.getTime()) / (1000 * 60 * 60 * 24));
            const finePerDay = this.configService.get('FINE_PER_DAY', 1.0);
            fineAmount = overdueDays * finePerDay;
        }
        const result = await this.prisma.$transaction(async (tx) => {
            const updatedLoan = await tx.loan.update({
                where: { id },
                data: {
                    status: client_1.LoanStatus.RETURNED,
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
            await this.booksService.updateAvailableCopies(loan.bookId, 1);
            if (isOverdue && fineAmount > 0) {
                await this.usersService.addFine(loan.userId, fineAmount);
            }
            return updatedLoan;
        });
        return result;
    }
    async renewLoan(id) {
        const loan = await this.findOne(id);
        if (loan.status !== client_1.LoanStatus.ACTIVE) {
            throw new common_1.BadRequestException('Only active loans can be renewed');
        }
        if (loan.renewalCount >= this.configService.get('MAX_RENEWALS', 2)) {
            throw new common_1.ConflictException('Loan has reached maximum renewal limit');
        }
        const pendingReservations = await this.prisma.reservation.count({
            where: {
                bookId: loan.bookId,
                status: 'ACTIVE',
            },
        });
        if (pendingReservations > 0) {
            throw new common_1.ConflictException('Cannot renew loan as there are pending reservations for this book');
        }
        const loanDurationDays = this.configService.get('LOAN_DURATION_DAYS', 14);
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
    async findByUser(userId, paginationDto) {
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
        const meta = new pagination_dto_1.PaginationMeta(total, page, limit);
        return {
            data: loans,
            meta,
        };
    }
    async findOverdueLoans() {
        const currentDate = new Date();
        return this.prisma.loan.findMany({
            where: {
                dueDate: {
                    lt: currentDate,
                },
                status: client_1.LoanStatus.ACTIVE,
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
    async updateOverdueLoans() {
        const currentDate = new Date();
        const result = await this.prisma.loan.updateMany({
            where: {
                dueDate: {
                    lt: currentDate,
                },
                status: client_1.LoanStatus.ACTIVE,
            },
            data: {
                status: client_1.LoanStatus.OVERDUE,
            },
        });
        return { updated: result.count };
    }
    async getStatistics() {
        const [totalLoans, activeLoans, overdueLoans, returnedLoans, totalFines] = await Promise.all([
            this.prisma.loan.count(),
            this.prisma.loan.count({ where: { status: client_1.LoanStatus.ACTIVE } }),
            this.prisma.loan.count({ where: { status: client_1.LoanStatus.OVERDUE } }),
            this.prisma.loan.count({ where: { status: client_1.LoanStatus.RETURNED } }),
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
    getMaxLoansForUserType(userType) {
        switch (userType) {
            case 'STUDENT':
                return this.configService.get('MAX_LOANS_STUDENT', 3);
            case 'TEACHER':
                return this.configService.get('MAX_LOANS_TEACHER', 10);
            case 'PUBLIC':
                return this.configService.get('MAX_LOANS_PUBLIC', 2);
            default:
                return 2;
        }
    }
};
exports.LoansService = LoansService;
exports.LoansService = LoansService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        books_service_1.BooksService,
        users_service_1.UsersService,
        config_1.ConfigService])
], LoansService);
//# sourceMappingURL=loans.service.js.map