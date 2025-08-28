import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PaginationDto, PaginatedResult } from '../common/dto/pagination.dto';
import { Category } from '@prisma/client';
export declare class CategoriesService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createCategoryDto: CreateCategoryDto): Promise<Category>;
    findAll(paginationDto: PaginationDto): Promise<PaginatedResult<Category>>;
    findOne(id: number): Promise<Category>;
    update(id: number, updateCategoryDto: UpdateCategoryDto): Promise<Category>;
    remove(id: number): Promise<{
        message: string;
    }>;
    findByName(name: string): Promise<Category | null>;
    getStatistics(): Promise<{
        totalCategories: number;
        categoriesWithBooks: number;
        categoriesWithoutBooks: number;
        mostPopularCategory: {
            name: string;
            bookCount: number;
        };
    }>;
}
