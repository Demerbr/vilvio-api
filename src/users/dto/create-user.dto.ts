import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsEnum,
  IsOptional,
  IsInt,
  Min,
  Max,
  IsDecimal,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserType, UserStatus } from '@prisma/client';
import { Type } from 'class-transformer';

export class CreateUserDto {
  @ApiProperty({
    description: 'Full name of the user',
    example: 'John Doe',
  })
  @IsString({ message: 'Name must be a string' })
  @IsNotEmpty({ message: 'Name is required' })
  name: string;

  @ApiProperty({
    description: 'User email address',
    example: 'john.doe@example.com',
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @ApiPropertyOptional({
    description: 'Phone number',
    example: '+5511999999999',
  })
  @IsOptional()
  @IsString({ message: 'Phone must be a string' })
  phone?: string;

  @ApiPropertyOptional({
    description: 'Complete address',
    example: 'Rua das Flores, 123, São Paulo, SP',
  })
  @IsOptional()
  @IsString({ message: 'Address must be a string' })
  address?: string;

  @ApiPropertyOptional({
    description: 'User age',
    example: 25,
    minimum: 5,
    maximum: 120,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Age must be an integer' })
  @Min(5, { message: 'Age must be at least 5 years' })
  @Max(120, { message: 'Age must be less than 120 years' })
  age?: number;

  @ApiProperty({
    description: 'Type of user',
    enum: UserType,
    example: UserType.STUDENT,
  })
  @IsEnum(UserType, { message: 'User type must be STUDENT, TEACHER, or PUBLIC' })
  @IsNotEmpty({ message: 'User type is required' })
  userType: UserType;

  @ApiPropertyOptional({
    description: 'Array of borrowed book IDs',
    example: [1, 2, 3],
    type: [Number],
  })
  @IsOptional()
  borrowedBooks?: number[];

  @ApiPropertyOptional({
    description: 'Array of reserved book IDs',
    example: [4, 5],
    type: [Number],
  })
  @IsOptional()
  reservedBooks?: number[];

  @ApiPropertyOptional({
    description: 'Total fines amount',
    example: 5.50,
    minimum: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @Min(0, { message: 'Fines cannot be negative' })
  fines?: number;

  @ApiPropertyOptional({
    description: 'User status',
    enum: UserStatus,
    example: UserStatus.ACTIVE,
    default: UserStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(UserStatus, { message: 'Status must be ACTIVE, SUSPENDED, or INACTIVE' })
  status?: UserStatus;

  @ApiPropertyOptional({
    description: 'User password (for authentication)',
    example: 'password123',
  })
  @IsOptional()
  @IsString({ message: 'Password must be a string' })
  password?: string;
}