import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  IsEnum,
  IsOptional,
  IsInt,
  Min,
  Max,
  IsPhoneNumber,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserType } from '@prisma/client';

export class RegisterDto {
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

  @ApiProperty({
    description: 'User password',
    example: 'password123',
    minLength: 6,
  })
  @IsString({ message: 'Password must be a string' })
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;

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
}