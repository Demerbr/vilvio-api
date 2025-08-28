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
import { BooksService } from './books.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PaginationDto } from '../common/dto/pagination.dto';

@ApiTags('Books')
@Controller('books')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new book' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Book created successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Book with this ISBN already exists',
  })
  create(@Body() createBookDto: CreateBookDto) {
    return this.booksService.create(createBookDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all books with pagination and search' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'search', required: false, type: String, example: 'Harry Potter' })
  @ApiQuery({ name: 'sortBy', required: false, type: String, example: 'title' })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'], example: 'asc' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Books retrieved successfully',
  })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.booksService.findAll(paginationDto);
  }

  @Get('available')
  @ApiOperation({ summary: 'Get all available books' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Available books retrieved successfully',
  })
  findAvailable(@Query() paginationDto: PaginationDto) {
    return this.booksService.findAvailable(paginationDto);
  }

  @Get('genre/:genre')
  @ApiOperation({ summary: 'Get books by genre' })
  @ApiParam({ name: 'genre', type: String, example: 'Fantasy' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Books by genre retrieved successfully',
  })
  findByGenre(
    @Param('genre') genre: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.booksService.findByGenre(genre, paginationDto);
  }

  @Get('popular')
  @ApiOperation({ summary: 'Get popular books based on loan frequency' })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Popular books retrieved successfully',
  })
  findPopular(@Query('limit', new ParseIntPipe({ optional: true })) limit?: number) {
    return this.booksService.findPopular(limit);
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get book statistics' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Book statistics retrieved successfully',
  })
  getStatistics() {
    return this.booksService.getStatistics();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a book by ID' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Book retrieved successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Book not found',
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.booksService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a book' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Book updated successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Book not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBookDto: UpdateBookDto,
  ) {
    return this.booksService.update(id, updateBookDto);
  }

  @Patch(':id/copies')
  @ApiOperation({ summary: 'Update available copies of a book' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiQuery({ name: 'increment', type: Number, example: 1, description: 'Number to increment (positive) or decrement (negative)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Book copies updated successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Book not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid increment value or insufficient copies',
  })
  updateAvailableCopies(
    @Param('id', ParseIntPipe) id: number,
    @Query('increment', ParseIntPipe) increment: number,
  ) {
    return this.booksService.updateAvailableCopies(id, increment);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a book' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Book deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Book not found',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Cannot delete book with active loans or reservations',
  })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.booksService.remove(id);
  }
}