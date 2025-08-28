import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseIntPipe,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { LoansService } from './loans.service';
import { CreateLoanDto } from './dto/create-loan.dto';
import { UpdateLoanDto } from './dto/update-loan.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PaginationDto } from '../common/dto/pagination.dto';

@ApiTags('Loans')
@Controller('loans')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class LoansController {
  constructor(private readonly loansService: LoansService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new loan (borrow a book)' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Loan created successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data or user not active',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Book not available or user already has active loan for this book',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User or book not found',
  })
  create(@Body() createLoanDto: CreateLoanDto) {
    return this.loansService.create(createLoanDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all loans with pagination and search' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'search', required: false, type: String, example: 'John Doe' })
  @ApiQuery({ name: 'sortBy', required: false, type: String, example: 'createdAt' })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'], example: 'desc' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Loans retrieved successfully',
  })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.loansService.findAll(paginationDto);
  }

  @Get('overdue')
  @ApiOperation({ summary: 'Get all overdue loans' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Overdue loans retrieved successfully',
  })
  findOverdueLoans() {
    return this.loansService.findOverdueLoans();
  }

  @Patch('update-overdue')
  @ApiOperation({ summary: 'Update status of overdue loans' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Overdue loans updated successfully',
  })
  updateOverdueLoans() {
    return this.loansService.updateOverdueLoans();
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get loan statistics' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Loan statistics retrieved successfully',
  })
  getStatistics() {
    return this.loansService.getStatistics();
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get loans by user ID' })
  @ApiParam({ name: 'userId', type: Number, example: 1 })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'sortBy', required: false, type: String, example: 'createdAt' })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'], example: 'desc' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User loans retrieved successfully',
  })
  findByUser(
    @Param('userId', ParseIntPipe) userId: number,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.loansService.findByUser(userId, paginationDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a loan by ID' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Loan retrieved successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Loan not found',
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.loansService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a loan' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Loan updated successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Loan not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateLoanDto: UpdateLoanDto,
  ) {
    return this.loansService.update(id, updateLoanDto);
  }

  @Patch(':id/return')
  @ApiOperation({ summary: 'Return a borrowed book' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Book returned successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Loan not found',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Book has already been returned',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Only active or overdue loans can be returned',
  })
  returnBook(@Param('id', ParseIntPipe) id: number) {
    return this.loansService.returnBook(id);
  }

  @Patch(':id/renew')
  @ApiOperation({ summary: 'Renew a loan (extend due date)' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Loan renewed successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Loan not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Only active loans can be renewed',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Loan has reached maximum renewal limit or there are pending reservations',
  })
  renewLoan(@Param('id', ParseIntPipe) id: number) {
    return this.loansService.renewLoan(id);
  }
}