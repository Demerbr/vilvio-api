import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PaginationDto, PaginatedResult, PaginationMeta } from '../common/dto/pagination.dto';
import { Category } from '@prisma/client';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    // Check if category with same name already exists
    const existingCategory = await this.prisma.category.findUnique({
      where: { name: createCategoryDto.name },
    });

    if (existingCategory) {
      throw new ConflictException('Category with this name already exists');
    }

    return this.prisma.category.create({
      data: createCategoryDto,
    });
  }

  async findAll(paginationDto: PaginationDto): Promise<PaginatedResult<Category>> {
    const { page = 1, limit = 10, search, sortBy = 'name', sortOrder = 'asc' } = paginationDto;
    const skip = (page - 1) * limit;

    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { description: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const orderBy = { [sortBy]: sortOrder };

    const [categories, total] = await Promise.all([
      this.prisma.category.findMany({
        where,
        skip,
        take: limit,
        orderBy,
      }),
      this.prisma.category.count({ where }),
    ]);

    const meta = new PaginationMeta(total, page, limit);

    return {
      data: categories,
      meta,
    };
  }

  async findOne(id: number): Promise<Category> {
    const category = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    return category;
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto): Promise<Category> {
    // Check if category exists
    const existingCategory = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    // Check if name is being updated and if it conflicts with another category
    if (updateCategoryDto.name && updateCategoryDto.name !== existingCategory.name) {
      const nameConflict = await this.prisma.category.findUnique({
        where: { name: updateCategoryDto.name },
      });

      if (nameConflict) {
        throw new ConflictException('Category with this name already exists');
      }
    }

    return this.prisma.category.update({
      where: { id },
      data: updateCategoryDto,
    });
  }

  async remove(id: number): Promise<{ message: string }> {
    // Check if category exists
    const category = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    // Check if category has associated books
    if (category.booksCount > 0) {
      throw new ConflictException(
        'Cannot delete category that has associated books. Please reassign or remove the books first.',
      );
    }

    await this.prisma.category.delete({
      where: { id },
    });

    return { message: 'Category deleted successfully' };
  }

  async findByName(name: string): Promise<Category | null> {
    return this.prisma.category.findUnique({
      where: { name },
    });
  }

  async getStatistics() {
    const [totalCategories, categoriesWithBooks, mostPopularCategory] = await Promise.all([
      this.prisma.category.count(),
      this.prisma.category.count({
        where: {
          booksCount: {
            gt: 0,
          },
        },
      }),
      this.prisma.category.findFirst({
        orderBy: {
          booksCount: 'desc',
        },
      }),
    ]);

    return {
      totalCategories,
      categoriesWithBooks,
      categoriesWithoutBooks: totalCategories - categoriesWithBooks,
      mostPopularCategory: mostPopularCategory
        ? {
            name: mostPopularCategory.name,
            bookCount: mostPopularCategory.booksCount,
          }
        : null,
    };
  }
}