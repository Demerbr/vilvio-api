import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { User } from '@prisma/client';
export interface JwtPayload {
    sub: number;
    email: string;
    userType: string;
    iat?: number;
    exp?: number;
}
export interface AuthResponse {
    user: Omit<User, 'password'>;
    access_token: string;
    token_type: string;
    expires_in: string;
}
export declare class AuthService {
    private usersService;
    private jwtService;
    constructor(usersService: UsersService, jwtService: JwtService);
    validateUser(email: string, password: string): Promise<any>;
    login(loginDto: LoginDto): Promise<AuthResponse>;
    register(registerDto: RegisterDto): Promise<AuthResponse>;
    validateJwtPayload(payload: JwtPayload): Promise<any>;
    refreshToken(user: any): Promise<{
        access_token: string;
    }>;
}
