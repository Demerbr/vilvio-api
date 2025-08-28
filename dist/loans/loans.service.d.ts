import { PrismaService } from '../prisma/prisma.service';
import { CreateLoanDto } from './dto/create-loan.dto';
import { UpdateLoanDto } from './dto/update-loan.dto';
import { PaginationDto, PaginatedResult } from '../common/dto/pagination.dto';
import { Loan } from '@prisma/client';
import { BooksService } from '../books/books.service';
import { UsersService } from '../users/users.service';
import { ConfigService } from '@nestjs/config';
export declare class LoansService {
    private prisma;
    private booksService;
    private usersService;
    private configService;
    constructor(prisma: PrismaService, booksService: BooksService, usersService: UsersService, configService: ConfigService);
    create(createLoanDto: CreateLoanDto): Promise<Loan>;
    findAll(paginationDto: PaginationDto): Promise<PaginatedResult<Loan>>;
    findOne(id: number): Promise<Loan>;
    update(id: number, updateLoanDto: UpdateLoanDto): Promise<Loan>;
    returnBook(id: number): Promise<Loan>;
    renewLoan(id: number): Promise<Loan>;
    findByUser(userId: number, paginationDto: PaginationDto): Promise<PaginatedResult<Loan>>;
    findOverdueLoans(): Promise<Loan[]>;
    updateOverdueLoans(): Promise<{
        updated: number;
    }>;
    getStatistics(): Promise<{
        totalLoans: number;
        activeLoans: number;
        overdueLoans: number;
        returnedLoans: number;
        totalFines: number | import("@prisma/client/runtime/library").Decimal;
    }>;
    private getMaxLoansForUserType;
}
