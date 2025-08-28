import { PrismaService } from '../prisma/prisma.service';
import { CreateInstitutionDto } from './dto/create-institution.dto';
import { UpdateInstitutionDto } from './dto/update-institution.dto';
import { PaginationDto, PaginatedResult } from '../common/dto/pagination.dto';
import { Institution } from '@prisma/client';
export declare class InstitutionsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createInstitutionDto: CreateInstitutionDto): Promise<Institution>;
    findAll(paginationDto: PaginationDto): Promise<PaginatedResult<Institution>>;
    findOne(id: number): Promise<Institution>;
    update(id: number, updateInstitutionDto: UpdateInstitutionDto): Promise<Institution>;
    remove(id: number): Promise<{
        message: string;
    }>;
    findByName(name: string): Promise<Institution | null>;
    getStatistics(): Promise<{
        totalInstitutions: number;
        mostActiveInstitution: {
            name: string;
            memberCount: number;
        };
    }>;
}
