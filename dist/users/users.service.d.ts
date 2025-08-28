import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationDto, PaginatedResult } from '../common/dto/pagination.dto';
import { User, UserStatus, Prisma } from '@prisma/client';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createUserDto: CreateUserDto): Promise<User>;
    findAll(paginationDto: PaginationDto): Promise<PaginatedResult<Omit<User, 'password'>>>;
    findOne(id: number): Promise<User>;
    findByEmail(email: string): Promise<User | null>;
    update(id: number, updateUserDto: UpdateUserDto): Promise<User>;
    remove(id: number): Promise<{
        message: string;
    }>;
    updateStatus(id: number, status: UserStatus): Promise<User>;
    updateLastActivity(id: number): Promise<void>;
    addFine(id: number, amount: number): Promise<User>;
    payFine(id: number, amount: number): Promise<User>;
    getUserStats(id: number): Promise<{
        user: {
            id: number;
            name: string;
            email: string;
            userType: import(".prisma/client").$Enums.UserType;
            status: import(".prisma/client").$Enums.UserStatus;
            fines: Prisma.Decimal;
        };
        stats: {
            activeLoans: number;
            overdueLoans: number;
            totalLoans: number;
            activeReservations: number;
            totalReservations: number;
            canBorrow: boolean;
        };
    }>;
}
