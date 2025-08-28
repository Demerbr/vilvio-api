import { UserType, UserStatus } from '@prisma/client';
export declare class CreateUserDto {
    name: string;
    email: string;
    phone?: string;
    address?: string;
    age?: number;
    userType: UserType;
    borrowedBooks?: number[];
    reservedBooks?: number[];
    fines?: number;
    status?: UserStatus;
    password?: string;
}
