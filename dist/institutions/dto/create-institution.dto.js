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
exports.CreateInstitutionDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
class CreateInstitutionDto {
}
exports.CreateInstitutionDto = CreateInstitutionDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Name of the institution',
        example: 'Central University',
        maxLength: 255,
    }),
    (0, class_validator_1.IsString)({ message: 'Name must be a string' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Name is required' }),
    (0, class_validator_1.MaxLength)(255, { message: 'Name must not exceed 255 characters' }),
    __metadata("design:type", String)
], CreateInstitutionDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Type of the institution',
        enum: client_1.InstitutionType,
        example: client_1.InstitutionType.UNIVERSITY,
    }),
    (0, class_validator_1.IsEnum)(client_1.InstitutionType, { message: 'Type must be a valid institution type' }),
    __metadata("design:type", String)
], CreateInstitutionDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Address of the institution',
        example: '123 University Ave, City, State 12345',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Address must be a string' }),
    __metadata("design:type", String)
], CreateInstitutionDto.prototype, "address", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Contact phone number',
        example: '+1-555-123-4567',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Contact phone must be a string' }),
    __metadata("design:type", String)
], CreateInstitutionDto.prototype, "contactPhone", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Contact email address',
        example: 'contact@centraluniversity.edu',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEmail)({}, { message: 'Contact email must be a valid email address' }),
    __metadata("design:type", String)
], CreateInstitutionDto.prototype, "contactEmail", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Website URL of the institution',
        example: 'https://www.centraluniversity.edu',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Website must be a string' }),
    __metadata("design:type", String)
], CreateInstitutionDto.prototype, "website", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Description of the institution',
        example: 'A leading educational institution focused on academic excellence',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Description must be a string' }),
    __metadata("design:type", String)
], CreateInstitutionDto.prototype, "description", void 0);
//# sourceMappingURL=create-institution.dto.js.map