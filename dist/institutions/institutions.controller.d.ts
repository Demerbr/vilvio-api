import { InstitutionsService } from './institutions.service';
import { CreateInstitutionDto } from './dto/create-institution.dto';
import { UpdateInstitutionDto } from './dto/update-institution.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
export declare class InstitutionsController {
    private readonly institutionsService;
    constructor(institutionsService: InstitutionsService);
    create(createInstitutionDto: CreateInstitutionDto): Promise<{
        status: import(".prisma/client").$Enums.InstitutionStatus;
        type: import(".prisma/client").$Enums.InstitutionType;
        name: string;
        id: number;
        lastUpdated: Date;
        email: string | null;
        phone: string | null;
        address: string | null;
        totalBooks: number;
        createdDate: Date;
        website: string | null;
        director: string | null;
        foundedYear: number | null;
        totalMembers: number;
        operatingHours: string | null;
        services: string[];
    }>;
    findAll(paginationDto: PaginationDto): Promise<import("../common/dto/pagination.dto").PaginatedResult<{
        status: import(".prisma/client").$Enums.InstitutionStatus;
        type: import(".prisma/client").$Enums.InstitutionType;
        name: string;
        id: number;
        lastUpdated: Date;
        email: string | null;
        phone: string | null;
        address: string | null;
        totalBooks: number;
        createdDate: Date;
        website: string | null;
        director: string | null;
        foundedYear: number | null;
        totalMembers: number;
        operatingHours: string | null;
        services: string[];
    }>>;
    getStatistics(): Promise<{
        totalInstitutions: number;
        mostActiveInstitution: {
            name: string;
            memberCount: number;
        };
    }>;
    findOne(id: number): Promise<{
        status: import(".prisma/client").$Enums.InstitutionStatus;
        type: import(".prisma/client").$Enums.InstitutionType;
        name: string;
        id: number;
        lastUpdated: Date;
        email: string | null;
        phone: string | null;
        address: string | null;
        totalBooks: number;
        createdDate: Date;
        website: string | null;
        director: string | null;
        foundedYear: number | null;
        totalMembers: number;
        operatingHours: string | null;
        services: string[];
    }>;
    update(id: number, updateInstitutionDto: UpdateInstitutionDto): Promise<{
        status: import(".prisma/client").$Enums.InstitutionStatus;
        type: import(".prisma/client").$Enums.InstitutionType;
        name: string;
        id: number;
        lastUpdated: Date;
        email: string | null;
        phone: string | null;
        address: string | null;
        totalBooks: number;
        createdDate: Date;
        website: string | null;
        director: string | null;
        foundedYear: number | null;
        totalMembers: number;
        operatingHours: string | null;
        services: string[];
    }>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
