import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsDateString,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateReservationDto {
  @ApiProperty({
    description: 'ID of the user making the reservation',
    example: 1,
    minimum: 1,
  })
  @Type(() => Number)
  @IsInt({ message: 'User ID must be an integer' })
  @Min(1, { message: 'User ID must be at least 1' })
  userId: number;

  @ApiProperty({
    description: 'ID of the book being reserved',
    example: 1,
    minimum: 1,
  })
  @Type(() => Number)
  @IsInt({ message: 'Book ID must be an integer' })
  @Min(1, { message: 'Book ID must be at least 1' })
  bookId: number;

  @ApiPropertyOptional({
    description: 'Custom expiry date for the reservation (ISO string format)',
    example: '2024-02-15T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString({}, { message: 'Expiry date must be a valid ISO date string' })
  expiryDate?: string;
}