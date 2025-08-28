import { InstitutionType } from '@prisma/client';
export declare class CreateInstitutionDto {
    name: string;
    type: InstitutionType;
    address?: string;
    contactPhone?: string;
    contactEmail?: string;
    website?: string;
    description?: string;
}
