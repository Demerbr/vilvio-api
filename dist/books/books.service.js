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
exports.BooksService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const pagination_dto_1 = require("../common/dto/pagination.dto");
let BooksService = class BooksService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createBookDto) {
        try {
            if (createBookDto.isbn) {
                const existingBook = await this.prisma.book.findUnique({
                    where: { isbn: createBookDto.isbn },
                });
                if (existingBook) {
                    throw new common_1.ConflictException('Book with this ISBN already exists');
                }
            }
            if (createBookDto.totalCopies < 1) {
                throw new common_1.BadRequestException('Total copies must be at least 1');
            }
            if (createBookDto.availableCopies > createBookDto.totalCopies) {
                throw new common_1.BadRequestException('Available copies cannot exceed total copies');
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
        }
        catch (error) {
            if (error.code === 'P2002') {
                throw new common_1.ConflictException('Book with this ISBN already exists');
            }
            throw error;
        }
    }
    async findAll(paginationDto) {
        const { page, limit, search, sortBy, sortOrder } = paginationDto;
        const skip = (page - 1) * limit;
        const where = search
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
        const orderBy = sortBy
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
        const meta = new pagination_dto_1.PaginationMeta(total, page, limit);
        return {
            data: books,
            meta,
        };
    }
    async findOne(id) {
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
            throw new common_1.NotFoundException(`Book with ID ${id} not found`);
        }
        return book;
    }
    async findByIsbn(isbn) {
        return this.prisma.book.findUnique({
            where: { isbn },
        });
    }
    async update(id, updateBookDto) {
        const existingBook = await this.prisma.book.findUnique({
            where: { id },
        });
        if (!existingBook) {
            throw new common_1.NotFoundException(`Book with ID ${id} not found`);
        }
        if (updateBookDto.isbn && updateBookDto.isbn !== existingBook.isbn) {
            const isbnExists = await this.prisma.book.findUnique({
                where: { isbn: updateBookDto.isbn },
            });
            if (isbnExists) {
                throw new common_1.ConflictException('Book with this ISBN already exists');
            }
        }
        const totalCopies = updateBookDto.totalCopies ?? existingBook.totalCopies;
        const availableCopies = updateBookDto.availableCopies ?? existingBook.availableCopies;
        if (totalCopies < 1) {
            throw new common_1.BadRequestException('Total copies must be at least 1');
        }
        if (availableCopies > totalCopies) {
            throw new common_1.BadRequestException('Available copies cannot exceed total copies');
        }
        if (availableCopies < 0) {
            throw new common_1.BadRequestException('Available copies cannot be negative');
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
        }
        catch (error) {
            if (error.code === 'P2002') {
                throw new common_1.ConflictException('Book with this ISBN already exists');
            }
            throw error;
        }
    }
    async remove(id) {
        const book = await this.prisma.book.findUnique({
            where: { id },
            include: {
                loans: { where: { status: 'ACTIVE' } },
                reservations: { where: { status: 'ACTIVE' } },
            },
        });
        if (!book) {
            throw new common_1.NotFoundException(`Book with ID ${id} not found`);
        }
        if (book.loans.length > 0) {
            throw new common_1.BadRequestException('Cannot delete book with active loans');
        }
        if (book.reservations.length > 0) {
            throw new common_1.BadRequestException('Cannot delete book with active reservations');
        }
        await this.prisma.book.delete({
            where: { id },
        });
        return { message: `Book with ID ${id} has been successfully deleted` };
    }
    async findAvailable(paginationDto) {
        const { page, limit, search, sortBy, sortOrder } = paginationDto;
        const skip = (page - 1) * limit;
        const where = {
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
        const orderBy = sortBy
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
        const meta = new pagination_dto_1.PaginationMeta(total, page, limit);
        return {
            data: books,
            meta,
        };
    }
    async findByGenre(genre, paginationDto) {
        const { page, limit, search, sortBy, sortOrder } = paginationDto;
        const skip = (page - 1) * limit;
        const where = {
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
        const orderBy = sortBy
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
        const meta = new pagination_dto_1.PaginationMeta(total, page, limit);
        return {
            data: books,
            meta,
        };
    }
    async findPopular(limit = 10) {
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
    async getStatistics() {
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
    async updateAvailableCopies(id, change) {
        const book = await this.prisma.book.findUnique({
            where: { id },
        });
        if (!book) {
            throw new common_1.NotFoundException(`Book with ID ${id} not found`);
        }
        const newAvailableCopies = book.availableCopies + change;
        if (newAvailableCopies < 0) {
            throw new common_1.BadRequestException('Available copies cannot be negative');
        }
        if (newAvailableCopies > book.totalCopies) {
            throw new common_1.BadRequestException('Available copies cannot exceed total copies');
        }
        return this.prisma.book.update({
            where: { id },
            data: {
                availableCopies: newAvailableCopies,
                lastUpdated: new Date(),
            },
        });
    }
};
exports.BooksService = BooksService;
exports.BooksService = BooksService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], BooksService);
//# sourceMappingURL=books.service.js.map