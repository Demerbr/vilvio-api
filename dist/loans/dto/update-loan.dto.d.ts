import { CreateLoanDto } from './create-loan.dto';
declare enum LoanStatus {
    ACTIVE = "ACTIVE",
    OVERDUE = "OVERDUE",
    RETURNED = "RETURNED",
    CANCELLED = "CANCELLED"
}
declare const UpdateLoanDto_base: import("@nestjs/common").Type<Partial<CreateLoanDto>>;
export declare class UpdateLoanDto extends UpdateLoanDto_base {
    status?: LoanStatus;
    returnDate?: string;
    fineAmount?: number;
    renewalCount?: number;
}
export {};
