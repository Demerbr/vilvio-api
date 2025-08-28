import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  Min,
  IsUrl,
  IsISBN,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateBookDto {
  @ApiProperty({
    description: 'Title of the book',
    example: 'Harry Potter and the Philosopher\'s Stone',
    maxLength: 255,
  })
  @IsString({ message: 'Title must be a string' })
  @IsNotEmpty({ message: 'Title is required' })
  @MaxLength(255, { message: 'Title must not exceed 255 characters' })
  title: string;

  @ApiProperty({
    description: 'Author of the book',
    example: 'J.K. Rowling',
    maxLength: 255,
  })
  @IsString({ message: 'Author must be a string' })
  @IsNotEmpty({ message: 'Author is required' })
  @MaxLength(255, { message: 'Author must not exceed 255 characters' })
  author: string;

  @ApiPropertyOptional({
    description: 'ISBN code of the book',
    example: '978-0-7475-3269-9',
  })
  @IsOptional()
  @IsString({ message: 'ISBN must be a string' })
  isbn?: string;

  @ApiPropertyOptional({
    description: 'Genre of the book',
    example: 'Fantasy',
    maxLength: 100,
  })
  @IsOptional()
  @IsString({ message: 'Genre must be a string' })
  @MaxLength(100, { message: 'Genre must not exceed 100 characters' })
  genre?: string;

  @ApiPropertyOptional({
    description: 'Publication year',
    example: 1997,
    minimum: 1000,
    maximum: 2030,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Publication year must be an integer' })
  @Min(1000, { message: 'Publication year must be at least 1000' })
  publicationYear?: number;

  @ApiPropertyOptional({
    description: 'Publisher of the book',
    example: 'Bloomsbury Publishing',
    maxLength: 255,
  })
  @IsOptional()
  @IsString({ message: 'Publisher must be a string' })
  @MaxLength(255, { message: 'Publisher must not exceed 255 characters' })
  publisher?: string;

  @ApiPropertyOptional({
    description: 'Number of pages',
    example: 223,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Pages must be an integer' })
  @Min(1, { message: 'Pages must be at least 1' })
  pages?: number;

  @ApiPropertyOptional({
    description: 'Language of the book',
    example: 'English',
    maxLength: 50,
  })
  @IsOptional()
  @IsString({ message: 'Language must be a string' })
  @MaxLength(50, { message: 'Language must not exceed 50 characters' })
  language?: string;

  @ApiPropertyOptional({
    description: 'Number of available copies',
    example: 5,
    minimum: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Available copies must be an integer' })
  @Min(0, { message: 'Available copies cannot be negative' })
  availableCopies?: number;

  @ApiProperty({
    description: 'Total number of copies',
    example: 5,
    minimum: 1,
  })
  @Type(() => Number)
  @IsInt({ message: 'Total copies must be an integer' })
  @Min(1, { message: 'Total copies must be at least 1' })
  totalCopies: number;

  @ApiPropertyOptional({
    description: 'Physical location in the library',
    example: 'Section A, Shelf 3',
    maxLength: 255,
  })
  @IsOptional()
  @IsString({ message: 'Location must be a string' })
  @MaxLength(255, { message: 'Location must not exceed 255 characters' })
  location?: string;

  @ApiPropertyOptional({
    description: 'Description or synopsis of the book',
    example: 'A young wizard discovers his magical heritage...',
  })
  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  description?: string;

  @ApiPropertyOptional({
    description: 'URL of the book cover image',
    example: 'https://example.com/covers/harry-potter.jpg',
  })
  @IsOptional()
  @IsUrl({}, { message: 'Cover URL must be a valid URL' })
  coverUrl?: string;
}