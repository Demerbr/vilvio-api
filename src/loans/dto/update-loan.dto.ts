import { PartialType } from '@nestjs/swagger';
import { CreateLoanDto } from './create-loan.dto';
import { IsOptional, IsEnum, IsDateString, IsNumber, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

enum LoanStatus {
  ACTIVE = 'ACTIVE',
  OVERDUE = 'OVERDUE',
  RETURNED = 'RETURNED',
  CANCELLED = 'CANCELLED',
}

export class UpdateLoanDto extends PartialType(CreateLoanDto) {
  @ApiPropertyOptional({
    description: 'Status of the loan',
    enum: LoanStatus,
    example: LoanStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(LoanStatus, { message: 'Status must be a valid loan status' })
  status?: LoanStatus;

  @ApiPropertyOptional({
    description: 'Return date of the loan (ISO string format)',
    example: '2024-02-10T10:30:00.000Z',
  })
  @IsOptional()
  @IsDateString({}, { message: 'Return date must be a valid ISO date string' })
  returnDate?: string;

  @ApiPropertyOptional({
    description: 'Fine amount for overdue return',
    example: 5.50,
    minimum: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Fine amount must be a number with at most 2 decimal places' })
  @Min(0, { message: 'Fine amount cannot be negative' })
  fineAmount?: number;

  @ApiPropertyOptional({
    description: 'Number of times the loan has been renewed',
    example: 1,
    minimum: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Renewal count must be a number' })
  @Min(0, { message: 'Renewal count cannot be negative' })
  renewalCount?: number;
}