import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcryptjs';
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

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    try {
      const user = await this.usersService.findByEmail(email);
      
      if (!user) {
        return null;
      }

      // For now, we'll do simple password comparison
      // In production, you should hash passwords
      const isPasswordValid = await bcrypt.compare(password, user.password || password);
      
      if (isPasswordValid) {
        const { password: _, ...result } = user;
        return result;
      }
      
      return null;
    } catch (error) {
      return null;
    }
  }

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedException('Account is not active');
    }

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      userType: user.userType,
    };

    const access_token = this.jwtService.sign(payload);

    // Update last activity
    await this.usersService.updateLastActivity(user.id);

    return {
      user,
      access_token,
      token_type: 'Bearer',
      expires_in: '7d',
    };
  }

  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    // Check if user already exists
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Validate age for student type
    if (registerDto.userType === 'STUDENT' && (!registerDto.age || registerDto.age < 5)) {
      throw new BadRequestException('Students must be at least 5 years old');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(registerDto.password, 12);

    // Create user
    const userData = {
      ...registerDto,
      password: hashedPassword,
    };

    const user = await this.usersService.create(userData);
    const { password: _, ...userWithoutPassword } = user;

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      userType: user.userType,
    };

    const access_token = this.jwtService.sign(payload);

    return {
      user: userWithoutPassword,
      access_token,
      token_type: 'Bearer',
      expires_in: '7d',
    };
  }

  async validateJwtPayload(payload: JwtPayload): Promise<any> {
    const user = await this.usersService.findOne(payload.sub);
    
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedException('Account is not active');
    }

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async refreshToken(user: any): Promise<{ access_token: string }> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      userType: user.userType,
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}