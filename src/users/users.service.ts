import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationDto, PaginatedResult, PaginationMeta } from '../common/dto/pagination.dto';
import { User, UserStatus, Prisma } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      // Check if email already exists
      const existingUser = await this.prisma.user.findUnique({
        where: { email: createUserDto.email },
      });

      if (existingUser) {
        throw new ConflictException('User with this email already exists');
      }

      // Validate business rules
      if (createUserDto.userType === 'STUDENT' && (!createUserDto.age || createUserDto.age < 5)) {
        throw new BadRequestException('Students must be at least 5 years old');
      }

      const user = await this.prisma.user.create({
        data: {
          ...createUserDto,
          password: createUserDto.password || 'defaultPassword123', // Provide default password if not specified
          registrationDate: new Date(),
          lastActivity: new Date(),
        },
      });

      return user;
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('User with this email already exists');
      }
      throw error;
    }
  }

  async findAll(paginationDto: PaginationDto): Promise<PaginatedResult<Omit<User, 'password'>>> {
    const { page, limit, search, sortBy, sortOrder } = paginationDto;
    const skip = (page - 1) * limit;

    // Build where clause for search
    const where: Prisma.UserWhereInput = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
            { phone: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};

    // Build orderBy clause
    const orderBy: Prisma.UserOrderByWithRelationInput = sortBy
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

    const meta = new PaginationMeta(total, page, limit);

    return {
      data: users,
      meta,
    };
  }

  async findOne(id: number): Promise<User> {
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
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    // Check if user exists
    const existingUser = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Check email uniqueness if email is being updated
    if (updateUserDto.email && updateUserDto.email !== existingUser.email) {
      const emailExists = await this.prisma.user.findUnique({
        where: { email: updateUserDto.email },
      });

      if (emailExists) {
        throw new ConflictException('User with this email already exists');
      }
    }

    // Validate business rules
    if (updateUserDto.userType === 'STUDENT' && updateUserDto.age && updateUserDto.age < 5) {
      throw new BadRequestException('Students must be at least 5 years old');
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
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('User with this email already exists');
      }
      throw error;
    }
  }

  async remove(id: number): Promise<{ message: string }> {
    // Check if user exists
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        loans: { where: { status: 'ACTIVE' } },
        reservations: { where: { status: 'ACTIVE' } },
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Check if user has active loans or reservations
    if (user.loans.length > 0) {
      throw new BadRequestException('Cannot delete user with active loans');
    }

    if (user.reservations.length > 0) {
      throw new BadRequestException('Cannot delete user with active reservations');
    }

    // Check if user has outstanding fines
    if (user.fines.toNumber() > 0) {
      throw new BadRequestException('Cannot delete user with outstanding fines');
    }

    await this.prisma.user.delete({
      where: { id },
    });

    return { message: `User with ID ${id} has been successfully deleted` };
  }

  async updateStatus(id: number, status: UserStatus): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return this.prisma.user.update({
      where: { id },
      data: { status },
    });
  }

  async updateLastActivity(id: number): Promise<void> {
    await this.prisma.user.update({
      where: { id },
      data: { lastActivity: new Date() },
    });
  }

  async addFine(id: number, amount: number): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
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

  async payFine(id: number, amount: number): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    if (user.fines.toNumber() < amount) {
      throw new BadRequestException('Payment amount exceeds outstanding fines');
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

  async getUserStats(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        loans: true,
        reservations: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const activeLoans = user.loans.filter(loan => loan.status === 'ACTIVE').length;
    const overdueLoans = user.loans.filter(loan => 
      loan.status === 'ACTIVE' && new Date() > loan.dueDate
    ).length;
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
}