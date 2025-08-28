import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEmail,
  IsPhoneNumber,
  MaxLength,
  IsEnum,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { InstitutionType } from '@prisma/client';

export class CreateInstitutionDto {
  @ApiProperty({
    description: 'Name of the institution',
    example: 'Central University',
    maxLength: 255,
  })
  @IsString({ message: 'Name must be a string' })
  @IsNotEmpty({ message: 'Name is required' })
  @MaxLength(255, { message: 'Name must not exceed 255 characters' })
  name: string;

  @ApiProperty({
    description: 'Type of the institution',
    enum: InstitutionType,
    example: InstitutionType.UNIVERSITY,
  })
  @IsEnum(InstitutionType, { message: 'Type must be a valid institution type' })
  type: InstitutionType;

  @ApiPropertyOptional({
    description: 'Address of the institution',
    example: '123 University Ave, City, State 12345',
  })
  @IsOptional()
  @IsString({ message: 'Address must be a string' })
  address?: string;

  @ApiPropertyOptional({
    description: 'Contact phone number',
    example: '+1-555-123-4567',
  })
  @IsOptional()
  @IsString({ message: 'Contact phone must be a string' })
  contactPhone?: string;

  @ApiPropertyOptional({
    description: 'Contact email address',
    example: 'contact@centraluniversity.edu',
  })
  @IsOptional()
  @IsEmail({}, { message: 'Contact email must be a valid email address' })
  contactEmail?: string;

  @ApiPropertyOptional({
    description: 'Website URL of the institution',
    example: 'https://www.centraluniversity.edu',
  })
  @IsOptional()
  @IsString({ message: 'Website must be a string' })
  website?: string;

  @ApiPropertyOptional({
    description: 'Description of the institution',
    example: 'A leading educational institution focused on academic excellence',
  })
  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  description?: string;
}