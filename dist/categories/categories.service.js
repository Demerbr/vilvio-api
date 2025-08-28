"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoriesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const pagination_dto_1 = require("../common/dto/pagination.dto");
let CategoriesService = class CategoriesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createCategoryDto) {
        const existingCategory = await this.prisma.category.findUnique({
            where: { name: createCategoryDto.name },
        });
        if (existingCategory) {
            throw new common_1.ConflictException('Category with this name already exists');
        }
        return this.prisma.category.create({
            data: createCategoryDto,
        });
    }
    async findAll(paginationDto) {
        const { page = 1, limit = 10, search, sortBy = 'name', sortOrder = 'asc' } = paginationDto;
        const skip = (page - 1) * limit;
        const where = search
            ? {
                OR: [
                    { name: { contains: search, mode: 'insensitive' } },
                    { description: { contains: search, mode: 'insensitive' } },
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
        const meta = new pagination_dto_1.PaginationMeta(total, page, limit);
        return {
            data: categories,
            meta,
        };
    }
    async findOne(id) {
        const category = await this.prisma.category.findUnique({
            where: { id },
        });
        if (!category) {
            throw new common_1.NotFoundException(`Category with ID ${id} not found`);
        }
        return category;
    }
    async update(id, updateCategoryDto) {
        const existingCategory = await this.prisma.category.findUnique({
            where: { id },
        });
        if (!existingCategory) {
            throw new common_1.NotFoundException(`Category with ID ${id} not found`);
        }
        if (updateCategoryDto.name && updateCategoryDto.name !== existingCategory.name) {
            const nameConflict = await this.prisma.category.findUnique({
                where: { name: updateCategoryDto.name },
            });
            if (nameConflict) {
                throw new common_1.ConflictException('Category with this name already exists');
            }
        }
        return this.prisma.category.update({
            where: { id },
            data: updateCategoryDto,
        });
    }
    async remove(id) {
        const category = await this.prisma.category.findUnique({
            where: { id },
        });
        if (!category) {
            throw new common_1.NotFoundException(`Category with ID ${id} not found`);
        }
        if (category.booksCount > 0) {
            throw new common_1.ConflictException('Cannot delete category that has associated books. Please reassign or remove the books first.');
        }
        await this.prisma.category.delete({
            where: { id },
        });
        return { message: 'Category deleted successfully' };
    }
    async findByName(name) {
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
};
exports.CategoriesService = CategoriesService;
exports.CategoriesService = CategoriesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CategoriesService);
//# sourceMappingURL=categories.service.js.map