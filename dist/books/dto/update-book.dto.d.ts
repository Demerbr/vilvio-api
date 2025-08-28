import { CreateBookDto } from './create-book.dto';
declare enum BookStatus {
    ACTIVE = "ACTIVE",
    INACTIVE = "INACTIVE",
    DAMAGED = "DAMAGED",
    LOST = "LOST"
}
declare const UpdateBookDto_base: import("@nestjs/common").Type<Partial<CreateBookDto>>;
export declare class UpdateBookDto extends UpdateBookDto_base {
    status?: BookStatus;
}
export {};
