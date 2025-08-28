import { UserType } from '@prisma/client';
export declare class RegisterDto {
    name: string;
    email: string;
    password: string;
    phone?: string;
    address?: string;
    age?: number;
    userType: UserType;
}
