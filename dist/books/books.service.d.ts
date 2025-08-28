import { PrismaService } from '../prisma/prisma.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { PaginationDto, PaginatedResult } from '../common/dto/pagination.dto';
import { Book } from '@prisma/client';
export declare class BooksService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createBookDto: CreateBookDto): Promise<Book>;
    findAll(paginationDto: PaginationDto): Promise<PaginatedResult<Book>>;
    findOne(id: number): Promise<Book>;
    findByIsbn(isbn: string): Promise<Book | null>;
    update(id: number, updateBookDto: UpdateBookDto): Promise<Book>;
    remove(id: number): Promise<{
        message: string;
    }>;
    findAvailable(paginationDto: PaginationDto): Promise<PaginatedResult<Book>>;
    findByGenre(genre: string, paginationDto: PaginationDto): Promise<PaginatedResult<Book>>;
    findPopular(limit?: number): Promise<Book[]>;
    getStatistics(): Promise<any>;
    updateAvailableCopies(id: number, change: number): Promise<Book>;
}
