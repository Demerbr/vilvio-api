import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInstitutionDto } from './dto/create-institution.dto';
import { UpdateInstitutionDto } from './dto/update-institution.dto';
import { PaginationDto, PaginatedResult, PaginationMeta } from '../common/dto/pagination.dto';
import { Institution } from '@prisma/client';

@Injectable()
export class InstitutionsService {
  constructor(private prisma: PrismaService) {}

  async create(createInstitutionDto: CreateInstitutionDto): Promise<Institution> {
    // Check if institution with same name already exists
    const existingInstitution = await this.prisma.institution.findFirst({
      where: { name: createInstitutionDto.name },
    });

    if (existingInstitution) {
      throw new ConflictException('Institution with this name already exists');
    }

    return this.prisma.institution.create({
      data: createInstitutionDto,
    });
  }

  async findAll(paginationDto: PaginationDto): Promise<PaginatedResult<Institution>> {
    const { page = 1, limit = 10, search, sortBy = 'name', sortOrder = 'asc' } = paginationDto;
    const skip = (page - 1) * limit;

    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { address: { contains: search, mode: 'insensitive' as const } },
            { contactEmail: { contains: search, mode: 'insensitive' as const } },
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
      meta: new PaginationMeta(total, page, limit),
    };
  }

  async findOne(id: number): Promise<Institution> {
    const institution = await this.prisma.institution.findUnique({
      where: { id },
    });

    if (!institution) {
      throw new NotFoundException(`Institution with ID ${id} not found`);
    }

    return institution;
  }

  async update(id: number, updateInstitutionDto: UpdateInstitutionDto): Promise<Institution> {
    // Check if institution exists
    const existingInstitution = await this.prisma.institution.findUnique({
      where: { id },
    });

    if (!existingInstitution) {
      throw new NotFoundException(`Institution with ID ${id} not found`);
    }

    // Check if name is being updated and if it conflicts with another institution
    if (updateInstitutionDto.name && updateInstitutionDto.name !== existingInstitution.name) {
      const nameConflict = await this.prisma.institution.findFirst({
        where: { name: updateInstitutionDto.name },
      });

      if (nameConflict) {
        throw new ConflictException('Institution with this name already exists');
      }
    }

    return this.prisma.institution.update({
      where: { id },
      data: updateInstitutionDto,
    });
  }

  async remove(id: number): Promise<{ message: string }> {
    // Check if institution exists
    const institution = await this.prisma.institution.findUnique({
      where: { id },
    });

    if (!institution) {
      throw new NotFoundException(`Institution with ID ${id} not found`);
    }

    // Institution can be deleted directly as there are no user associations in the schema

    await this.prisma.institution.delete({
      where: { id },
    });

    return { message: 'Institution deleted successfully' };
  }

  async findByName(name: string): Promise<Institution | null> {
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
}