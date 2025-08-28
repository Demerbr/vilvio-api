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
exports.InstitutionsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const pagination_dto_1 = require("../common/dto/pagination.dto");
let InstitutionsService = class InstitutionsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createInstitutionDto) {
        const existingInstitution = await this.prisma.institution.findFirst({
            where: { name: createInstitutionDto.name },
        });
        if (existingInstitution) {
            throw new common_1.ConflictException('Institution with this name already exists');
        }
        return this.prisma.institution.create({
            data: createInstitutionDto,
        });
    }
    async findAll(paginationDto) {
        const { page = 1, limit = 10, search, sortBy = 'name', sortOrder = 'asc' } = paginationDto;
        const skip = (page - 1) * limit;
        const where = search
            ? {
                OR: [
                    { name: { contains: search, mode: 'insensitive' } },
                    { address: { contains: search, mode: 'insensitive' } },
                    { contactEmail: { contains: search, mode: 'insensitive' } },
                ],
            }
            : {};
        const orderBy = { [sortBy]: sortOrder };
        const [institutions, total] = await Promise.all([
            this.prisma.institution.findMany({
                where,
                skip,
                take: limit,
                orderBy,
            }),
            this.prisma.institution.count({ where }),
        ]);
        const totalPages = Math.ceil(total / limit);
        return {
            data: institutions,
            meta: new pagination_dto_1.PaginationMeta(total, page, limit),
        };
    }
    async findOne(id) {
        const institution = await this.prisma.institution.findUnique({
            where: { id },
        });
        if (!institution) {
            throw new common_1.NotFoundException(`Institution with ID ${id} not found`);
        }
        return institution;
    }
    async update(id, updateInstitutionDto) {
        const existingInstitution = await this.prisma.institution.findUnique({
            where: { id },
        });
        if (!existingInstitution) {
            throw new common_1.NotFoundException(`Institution with ID ${id} not found`);
        }
        if (updateInstitutionDto.name && updateInstitutionDto.name !== existingInstitution.name) {
            const nameConflict = await this.prisma.institution.findFirst({
                where: { name: updateInstitutionDto.name },
            });
            if (nameConflict) {
                throw new common_1.ConflictException('Institution with this name already exists');
            }
        }
        return this.prisma.institution.update({
            where: { id },
            data: updateInstitutionDto,
        });
    }
    async remove(id) {
        const institution = await this.prisma.institution.findUnique({
            where: { id },
        });
        if (!institution) {
            throw new common_1.NotFoundException(`Institution with ID ${id} not found`);
        }
        await this.prisma.institution.delete({
            where: { id },
        });
        return { message: 'Institution deleted successfully' };
    }
    async findByName(name) {
        return this.prisma.institution.findFirst({
            where: { name },
        });
    }
    async getStatistics() {
        const [totalInstitutions, mostActiveInstitution] = await Promise.all([
            this.prisma.institution.count(),
            this.prisma.institution.findFirst({
                orderBy: {
                    totalMembers: 'desc',
                },
            }),
        ]);
        return {
            totalInstitutions,
            mostActiveInstitution: mostActiveInstitution
                ? {
                    name: mostActiveInstitution.name,
                    memberCount: mostActiveInstitution.totalMembers,
                }
                : null,
        };
    }
};
exports.InstitutionsService = InstitutionsService;
exports.InstitutionsService = InstitutionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], InstitutionsService);
//# sourceMappingURL=institutions.service.js.map