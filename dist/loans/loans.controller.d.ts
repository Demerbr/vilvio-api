import { LoansService } from './loans.service';
import { CreateLoanDto } from './dto/create-loan.dto';
import { UpdateLoanDto } from './dto/update-loan.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
export declare class LoansController {
    private readonly loansService;
    constructor(loansService: LoansService);
    create(createLoanDto: CreateLoanDto): Promise<{
        status: import(".prisma/client").$Enums.LoanStatus;
        id: number;
        loanDate: Date;
        userId: number;
        bookId: number;
        dueDate: Date;
        returnDate: Date | null;
        renewalCount: number;
        maxRenewals: number;
        fine: import("@prisma/client/runtime/library").Decimal;
        notes: string | null;
    }>;
    findAll(paginationDto: PaginationDto): Promise<import("../common/dto/pagination.dto").PaginatedResult<{
        status: import(".prisma/client").$Enums.LoanStatus;
        id: number;
        loanDate: Date;
        userId: number;
        bookId: number;
        dueDate: Date;
        returnDate: Date | null;
        renewalCount: number;
        maxRenewals: number;
        fine: import("@prisma/client/runtime/library").Decimal;
        notes: string | null;
    }>>;
    findOverdueLoans(): Promise<{
        status: import(".prisma/client").$Enums.LoanStatus;
        id: number;
        loanDate: Date;
        userId: number;
        bookId: number;
        dueDate: Date;
        returnDate: Date | null;
        renewalCount: number;
        maxRenewals: number;
        fine: import("@prisma/client/runtime/library").Decimal;
        notes: string | null;
    }[]>;
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
    findByUser(userId: number, paginationDto: PaginationDto): Promise<import("../common/dto/pagination.dto").PaginatedResult<{
        status: import(".prisma/client").$Enums.LoanStatus;
        id: number;
        loanDate: Date;
        userId: number;
        bookId: number;
        dueDate: Date;
        returnDate: Date | null;
        renewalCount: number;
        maxRenewals: number;
        fine: import("@prisma/client/runtime/library").Decimal;
        notes: string | null;
    }>>;
    findOne(id: number): Promise<{
        status: import(".prisma/client").$Enums.LoanStatus;
        id: number;
        loanDate: Date;
        userId: number;
        bookId: number;
        dueDate: Date;
        returnDate: Date | null;
        renewalCount: number;
        maxRenewals: number;
        fine: import("@prisma/client/runtime/library").Decimal;
        notes: string | null;
    }>;
    update(id: number, updateLoanDto: UpdateLoanDto): Promise<{
        status: import(".prisma/client").$Enums.LoanStatus;
        id: number;
        loanDate: Date;
        userId: number;
        bookId: number;
        dueDate: Date;
        returnDate: Date | null;
        renewalCount: number;
        maxRenewals: number;
        fine: import("@prisma/client/runtime/library").Decimal;
        notes: string | null;
    }>;
    returnBook(id: number): Promise<{
        status: import(".prisma/client").$Enums.LoanStatus;
        id: number;
        loanDate: Date;
        userId: number;
        bookId: number;
        dueDate: Date;
        returnDate: Date | null;
        renewalCount: number;
        maxRenewals: number;
        fine: import("@prisma/client/runtime/library").Decimal;
        notes: string | null;
    }>;
    renewLoan(id: number): Promise<{
        status: import(".prisma/client").$Enums.LoanStatus;
        id: number;
        loanDate: Date;
        userId: number;
        bookId: number;
        dueDate: Date;
        returnDate: Date | null;
        renewalCount: number;
        maxRenewals: number;
        fine: import("@prisma/client/runtime/library").Decimal;
        notes: string | null;
    }>;
}
