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
exports.CreateBookDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
class CreateBookDto {
}
exports.CreateBookDto = CreateBookDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Title of the book',
        example: 'Harry Potter and the Philosopher\'s Stone',
        maxLength: 255,
    }),
    (0, class_validator_1.IsString)({ message: 'Title must be a string' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Title is required' }),
    (0, class_validator_1.MaxLength)(255, { message: 'Title must not exceed 255 characters' }),
    __metadata("design:type", String)
], CreateBookDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Author of the book',
        example: 'J.K. Rowling',
        maxLength: 255,
    }),
    (0, class_validator_1.IsString)({ message: 'Author must be a string' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Author is required' }),
    (0, class_validator_1.MaxLength)(255, { message: 'Author must not exceed 255 characters' }),
    __metadata("design:type", String)
], CreateBookDto.prototype, "author", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'ISBN code of the book',
        example: '978-0-7475-3269-9',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'ISBN must be a string' }),
    __metadata("design:type", String)
], CreateBookDto.prototype, "isbn", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Genre of the book',
        example: 'Fantasy',
        maxLength: 100,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Genre must be a string' }),
    (0, class_validator_1.MaxLength)(100, { message: 'Genre must not exceed 100 characters' }),
    __metadata("design:type", String)
], CreateBookDto.prototype, "genre", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Publication year',
        example: 1997,
        minimum: 1000,
        maximum: 2030,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)({ message: 'Publication year must be an integer' }),
    (0, class_validator_1.Min)(1000, { message: 'Publication year must be at least 1000' }),
    __metadata("design:type", Number)
], CreateBookDto.prototype, "publicationYear", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Publisher of the book',
        example: 'Bloomsbury Publishing',
        maxLength: 255,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Publisher must be a string' }),
    (0, class_validator_1.MaxLength)(255, { message: 'Publisher must not exceed 255 characters' }),
    __metadata("design:type", String)
], CreateBookDto.prototype, "publisher", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Number of pages',
        example: 223,
        minimum: 1,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)({ message: 'Pages must be an integer' }),
    (0, class_validator_1.Min)(1, { message: 'Pages must be at least 1' }),
    __metadata("design:type", Number)
], CreateBookDto.prototype, "pages", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Language of the book',
        example: 'English',
        maxLength: 50,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Language must be a string' }),
    (0, class_validator_1.MaxLength)(50, { message: 'Language must not exceed 50 characters' }),
    __metadata("design:type", String)
], CreateBookDto.prototype, "language", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Number of available copies',
        example: 5,
        minimum: 0,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)({ message: 'Available copies must be an integer' }),
    (0, class_validator_1.Min)(0, { message: 'Available copies cannot be negative' }),
    __metadata("design:type", Number)
], CreateBookDto.prototype, "availableCopies", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Total number of copies',
        example: 5,
        minimum: 1,
    }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)({ message: 'Total copies must be an integer' }),
    (0, class_validator_1.Min)(1, { message: 'Total copies must be at least 1' }),
    __metadata("design:type", Number)
], CreateBookDto.prototype, "totalCopies", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Physical location in the library',
        example: 'Section A, Shelf 3',
        maxLength: 255,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Location must be a string' }),
    (0, class_validator_1.MaxLength)(255, { message: 'Location must not exceed 255 characters' }),
    __metadata("design:type", String)
], CreateBookDto.prototype, "location", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Description or synopsis of the book',
        example: 'A young wizard discovers his magical heritage...',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Description must be a string' }),
    __metadata("design:type", String)
], CreateBookDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'URL of the book cover image',
        example: 'https://example.com/covers/harry-potter.jpg',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUrl)({}, { message: 'Cover URL must be a valid URL' }),
    __metadata("design:type", String)
], CreateBookDto.prototype, "coverUrl", void 0);
//# sourceMappingURL=create-book.dto.js.map