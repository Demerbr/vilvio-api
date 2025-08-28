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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const pagination_dto_1 = require("../common/dto/pagination.dto");
let UsersService = class UsersService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createUserDto) {
        try {
            const existingUser = await this.prisma.user.findUnique({
                where: { email: createUserDto.email },
            });
            if (existingUser) {
                throw new common_1.ConflictException('User with this email already exists');
            }
            if (createUserDto.userType === 'STUDENT' && (!createUserDto.age || createUserDto.age < 5)) {
                throw new common_1.BadRequestException('Students must be at least 5 years old');
            }
            const user = await this.prisma.user.create({
                data: {
                    ...createUserDto,
                    password: createUserDto.password || 'defaultPassword123',
                    registrationDate: new Date(),
                    lastActivity: new Date(),
                },
            });
            return user;
        }
        catch (error) {
            if (error.code === 'P2002') {
                throw new common_1.ConflictException('User with this email already exists');
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
                    { name: { contains: search, mode: 'insensitive' } },
                    { email: { contains: search, mode: 'insensitive' } },
                    { phone: { contains: search, mode: 'insensitive' } },
                ],
            }
            : {};
        const orderBy = sortBy
            ? { [sortBy]: sortOrder }
            : { registrationDate: 'desc' };
        const [users, total] = await Promise.all([
            this.prisma.user.findMany({
                where,
                skip,
                take: limit,
                orderBy,
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true,
                    address: true,
                    age: true,
                    userType: true,
                    registrationDate: true,
                    lastActivity: true,
                    borrowedBooks: true,
                    reservedBooks: true,
                    fines: true,
                    status: true,
                },
            }),
            this.prisma.user.count({ where }),
        ]);
        const meta = new pagination_dto_1.PaginationMeta(total, page, limit);
        return {
            data: users,
            meta,
        };
    }
    async findOne(id) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            include: {
                loans: {
                    include: {
                        book: {
                            select: {
                                id: true,
                                title: true,
                                author: true,
                                isbn: true,
                            },
                        },
                    },
                    orderBy: { loanDate: 'desc' },
                },
                reservations: {
                    include: {
                        book: {
                            select: {
                                id: true,
                                title: true,
                                author: true,
                                isbn: true,
                            },
                        },
                    },
                    orderBy: { reservationDate: 'desc' },
                },
            },
        });
        if (!user) {
            throw new common_1.NotFoundException(`User with ID ${id} not found`);
        }
        return user;
    }
    async findByEmail(email) {
        return this.prisma.user.findUnique({
            where: { email },
        });
    }
    async update(id, updateUserDto) {
        const existingUser = await this.prisma.user.findUnique({
            where: { id },
        });
        if (!existingUser) {
            throw new common_1.NotFoundException(`User with ID ${id} not found`);
        }
        if (updateUserDto.email && updateUserDto.email !== existingUser.email) {
            const emailExists = await this.prisma.user.findUnique({
                where: { email: updateUserDto.email },
            });
            if (emailExists) {
                throw new common_1.ConflictException('User with this email already exists');
            }
        }
        if (updateUserDto.userType === 'STUDENT' && updateUserDto.age && updateUserDto.age < 5) {
            throw new common_1.BadRequestException('Students must be at least 5 years old');
        }
        try {
            const updatedUser = await this.prisma.user.update({
                where: { id },
                data: {
                    ...updateUserDto,
                    lastActivity: new Date(),
                },
            });
            return updatedUser;
        }
        catch (error) {
            if (error.code === 'P2002') {
                throw new common_1.ConflictException('User with this email already exists');
            }
            throw error;
        }
    }
    async remove(id) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            include: {
                loans: { where: { status: 'ACTIVE' } },
                reservations: { where: { status: 'ACTIVE' } },
            },
        });
        if (!user) {
            throw new common_1.NotFoundException(`User with ID ${id} not found`);
        }
        if (user.loans.length > 0) {
            throw new common_1.BadRequestException('Cannot delete user with active loans');
        }
        if (user.reservations.length > 0) {
            throw new common_1.BadRequestException('Cannot delete user with active reservations');
        }
        if (user.fines.toNumber() > 0) {
            throw new common_1.BadRequestException('Cannot delete user with outstanding fines');
        }
        await this.prisma.user.delete({
            where: { id },
        });
        return { message: `User with ID ${id} has been successfully deleted` };
    }
    async updateStatus(id, status) {
        const user = await this.prisma.user.findUnique({
            where: { id },
        });
        if (!user) {
            throw new common_1.NotFoundException(`User with ID ${id} not found`);
        }
        return this.prisma.user.update({
            where: { id },
            data: { status },
        });
    }
    async updateLastActivity(id) {
        await this.prisma.user.update({
            where: { id },
            data: { lastActivity: new Date() },
        });
    }
    async addFine(id, amount) {
        const user = await this.prisma.user.findUnique({
            where: { id },
        });
        if (!user) {
            throw new common_1.NotFoundException(`User with ID ${id} not found`);
        }
        return this.prisma.user.update({
            where: { id },
            data: {
                fines: {
                    increment: amount,
                },
            },
        });
    }
    async payFine(id, amount) {
        const user = await this.prisma.user.findUnique({
            where: { id },
        });
        if (!user) {
            throw new common_1.NotFoundException(`User with ID ${id} not found`);
        }
        if (user.fines.toNumber() < amount) {
            throw new common_1.BadRequestException('Payment amount exceeds outstanding fines');
        }
        return this.prisma.user.update({
            where: { id },
            data: {
                fines: {
                    decrement: amount,
                },
            },
        });
    }
    async getUserStats(id) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            include: {
                loans: true,
                reservations: true,
            },
        });
        if (!user) {
            throw new common_1.NotFoundException(`User with ID ${id} not found`);
        }
        const activeLoans = user.loans.filter(loan => loan.status === 'ACTIVE').length;
        const overdueLoans = user.loans.filter(loan => loan.status === 'ACTIVE' && new Date() > loan.dueDate).length;
        const totalLoans = user.loans.length;
        const activeReservations = user.reservations.filter(res => res.status === 'ACTIVE').length;
        const totalReservations = user.reservations.length;
        return {
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                userType: user.userType,
                status: user.status,
                fines: user.fines,
            },
            stats: {
                activeLoans,
                overdueLoans,
                totalLoans,
                activeReservations,
                totalReservations,
                canBorrow: user.fines.toNumber() < 10 && user.status === 'ACTIVE',
            },
        };
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map