import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsDateString,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateLoanDto {
  @ApiProperty({
    description: 'ID of the user borrowing the book',
    example: 1,
    minimum: 1,
  })
  @Type(() => Number)
  @IsInt({ message: 'User ID must be an integer' })
  @Min(1, { message: 'User ID must be at least 1' })
  userId: number;

  @ApiProperty({
    description: 'ID of the book being borrowed',
    example: 1,
    minimum: 1,
  })
  @Type(() => Number)
  @IsInt({ message: 'Book ID must be an integer' })
  @Min(1, { message: 'Book ID must be at least 1' })
  bookId: number;

  @ApiPropertyOptional({
    description: 'Custom due date for the loan (ISO string format)',
    example: '2024-02-15T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString({}, { message: 'Due date must be a valid ISO date string' })
  dueDate?: string;
}