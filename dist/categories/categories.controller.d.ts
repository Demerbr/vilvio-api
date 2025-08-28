import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
export declare class CategoriesController {
    private readonly categoriesService;
    constructor(categoriesService: CategoriesService);
    create(createCategoryDto: CreateCategoryDto): Promise<{
        description: string | null;
        name: string;
        id: number;
        createdDate: Date;
        booksCount: number;
    }>;
    findAll(paginationDto: PaginationDto): Promise<import("../common/dto/pagination.dto").PaginatedResult<{
        description: string | null;
        name: string;
        id: number;
        createdDate: Date;
        booksCount: number;
    }>>;
    getStatistics(): Promise<{
        totalCategories: number;
        categoriesWithBooks: number;
        categoriesWithoutBooks: number;
        mostPopularCategory: {
            name: string;
            bookCount: number;
        };
    }>;
    findOne(id: number): Promise<{
        description: string | null;
        name: string;
        id: number;
        createdDate: Date;
        booksCount: number;
    }>;
    update(id: number, updateCategoryDto: UpdateCategoryDto): Promise<{
        description: string | null;
        name: string;
        id: number;
        createdDate: Date;
        booksCount: number;
    }>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
