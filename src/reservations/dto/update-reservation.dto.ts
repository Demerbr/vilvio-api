import { PartialType } from '@nestjs/swagger';
import { CreateReservationDto } from './create-reservation.dto';
import { IsOptional, IsEnum, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

enum ReservationStatus {
  PENDING = 'PENDING',
  READY = 'READY',
  FULFILLED = 'FULFILLED',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED',
}

export class UpdateReservationDto extends PartialType(CreateReservationDto) {
  @ApiPropertyOptional({
    description: 'Status of the reservation',
    enum: ReservationStatus,
    example: ReservationStatus.PENDING,
  })
  @IsOptional()
  @IsEnum(ReservationStatus, { message: 'Status must be a valid reservation status' })
  status?: ReservationStatus;

  @ApiPropertyOptional({
    description: 'Date when the reservation was fulfilled (ISO string format)',
    example: '2024-02-10T10:30:00.000Z',
  })
  @IsOptional()
  @IsDateString({}, { message: 'Fulfilled date must be a valid ISO date string' })
  fulfilledAt?: string;

  @ApiPropertyOptional({
    description: 'Date when the reservation was cancelled (ISO string format)',
    example: '2024-02-10T10:30:00.000Z',
  })
  @IsOptional()
  @IsDateString({}, { message: 'Cancelled date must be a valid ISO date string' })
  cancelledAt?: string;
}