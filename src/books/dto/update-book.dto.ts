import { PartialType } from '@nestjs/swagger';
import { CreateBookDto } from './create-book.dto';
import { IsOptional, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

enum BookStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  DAMAGED = 'DAMAGED',
  LOST = 'LOST',
}

export class UpdateBookDto extends PartialType(CreateBookDto) {
  @ApiPropertyOptional({
    description: 'Status of the book',
    enum: BookStatus,
    example: BookStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(BookStatus, { message: 'Status must be a valid book status' })
  status?: BookStatus;
}