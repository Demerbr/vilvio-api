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
exports.UpdateLoanDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const create_loan_dto_1 = require("./create-loan.dto");
const class_validator_1 = require("class-validator");
const swagger_2 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
var LoanStatus;
(function (LoanStatus) {
    LoanStatus["ACTIVE"] = "ACTIVE";
    LoanStatus["OVERDUE"] = "OVERDUE";
    LoanStatus["RETURNED"] = "RETURNED";
    LoanStatus["CANCELLED"] = "CANCELLED";
})(LoanStatus || (LoanStatus = {}));
class UpdateLoanDto extends (0, swagger_1.PartialType)(create_loan_dto_1.CreateLoanDto) {
}
exports.UpdateLoanDto = UpdateLoanDto;
__decorate([
    (0, swagger_2.ApiPropertyOptional)({
        description: 'Status of the loan',
        enum: LoanStatus,
        example: LoanStatus.ACTIVE,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(LoanStatus, { message: 'Status must be a valid loan status' }),
    __metadata("design:type", String)
], UpdateLoanDto.prototype, "status", void 0);
__decorate([
    (0, swagger_2.ApiPropertyOptional)({
        description: 'Return date of the loan (ISO string format)',
        example: '2024-02-10T10:30:00.000Z',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)({}, { message: 'Return date must be a valid ISO date string' }),
    __metadata("design:type", String)
], UpdateLoanDto.prototype, "returnDate", void 0);
__decorate([
    (0, swagger_2.ApiPropertyOptional)({
        description: 'Fine amount for overdue return',
        example: 5.50,
        minimum: 0,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 2 }, { message: 'Fine amount must be a number with at most 2 decimal places' }),
    (0, class_validator_1.Min)(0, { message: 'Fine amount cannot be negative' }),
    __metadata("design:type", Number)
], UpdateLoanDto.prototype, "fineAmount", void 0);
__decorate([
    (0, swagger_2.ApiPropertyOptional)({
        description: 'Number of times the loan has been renewed',
        example: 1,
        minimum: 0,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)({}, { message: 'Renewal count must be a number' }),
    (0, class_validator_1.Min)(0, { message: 'Renewal count cannot be negative' }),
    __metadata("design:type", Number)
], UpdateLoanDto.prototype, "renewalCount", void 0);
//# sourceMappingURL=update-loan.dto.js.map