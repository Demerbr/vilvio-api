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
import { ReservationsService } from './reservations.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PaginationDto } from '../common/dto/pagination.dto';

@ApiTags('Reservations')
@Controller('reservations')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new reservation' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Reservation created successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data or user not active',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'User already has active reservation or loan for this book, or reached reservation limit',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User or book not found',
  })
  create(@Body() createReservationDto: CreateReservationDto) {
    return this.reservationsService.create(createReservationDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all reservations with pagination and search' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'search', required: false, type: String, example: 'John Doe' })
  @ApiQuery({ name: 'sortBy', required: false, type: String, example: 'createdAt' })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'], example: 'desc' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Reservations retrieved successfully',
  })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.reservationsService.findAll(paginationDto);
  }

  @Get('expired')
  @ApiOperation({ summary: 'Get all expired reservations' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Expired reservations retrieved successfully',
  })
  findExpiredReservations() {
    return this.reservationsService.findExpiredReservations();
  }

  @Patch('update-expired')
  @ApiOperation({ summary: 'Update status of expired reservations' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Expired reservations updated successfully',
  })
  updateExpiredReservations() {
    return this.reservationsService.updateExpiredReservations();
  }

  @Patch('update-pending')
  @ApiOperation({ summary: 'Update pending reservations to ready when books become available' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Pending reservations updated successfully',
  })
  updatePendingReservations() {
    return this.reservationsService.updatePendingReservations();
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get reservation statistics' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Reservation statistics retrieved successfully',
  })
  getStatistics() {
    return this.reservationsService.getStatistics();
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get reservations by user ID' })
  @ApiParam({ name: 'userId', type: Number, example: 1 })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'sortBy', required: false, type: String, example: 'createdAt' })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'], example: 'desc' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User reservations retrieved successfully',
  })
  findByUser(
    @Param('userId', ParseIntPipe) userId: number,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.reservationsService.findByUser(userId, paginationDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a reservation by ID' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Reservation retrieved successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Reservation not found',
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.reservationsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a reservation' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Reservation updated successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Reservation not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateReservationDto: UpdateReservationDto,
  ) {
    return this.reservationsService.update(id, updateReservationDto);
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancel a reservation' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Reservation cancelled successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Reservation not found',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Reservation has already been cancelled',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Cannot cancel a fulfilled reservation',
  })
  cancel(@Param('id', ParseIntPipe) id: number) {
    return this.reservationsService.cancel(id);
  }

  @Patch(':id/fulfill')
  @ApiOperation({ summary: 'Fulfill a reservation (mark as completed)' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Reservation fulfilled successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Reservation not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Only ready reservations can be fulfilled',
  })
  fulfill(@Param('id', ParseIntPipe) id: number) {
    return this.reservationsService.fulfill(id);
  }
}