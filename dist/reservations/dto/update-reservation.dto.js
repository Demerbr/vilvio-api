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
exports.UpdateReservationDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const create_reservation_dto_1 = require("./create-reservation.dto");
const class_validator_1 = require("class-validator");
const swagger_2 = require("@nestjs/swagger");
var ReservationStatus;
(function (ReservationStatus) {
    ReservationStatus["PENDING"] = "PENDING";
    ReservationStatus["READY"] = "READY";
    ReservationStatus["FULFILLED"] = "FULFILLED";
    ReservationStatus["CANCELLED"] = "CANCELLED";
    ReservationStatus["EXPIRED"] = "EXPIRED";
})(ReservationStatus || (ReservationStatus = {}));
class UpdateReservationDto extends (0, swagger_1.PartialType)(create_reservation_dto_1.CreateReservationDto) {
}
exports.UpdateReservationDto = UpdateReservationDto;
__decorate([
    (0, swagger_2.ApiPropertyOptional)({
        description: 'Status of the reservation',
        enum: ReservationStatus,
        example: ReservationStatus.PENDING,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(ReservationStatus, { message: 'Status must be a valid reservation status' }),
    __metadata("design:type", String)
], UpdateReservationDto.prototype, "status", void 0);
__decorate([
    (0, swagger_2.ApiPropertyOptional)({
        description: 'Date when the reservation was fulfilled (ISO string format)',
        example: '2024-02-10T10:30:00.000Z',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)({}, { message: 'Fulfilled date must be a valid ISO date string' }),
    __metadata("design:type", String)
], UpdateReservationDto.prototype, "fulfilledAt", void 0);
__decorate([
    (0, swagger_2.ApiPropertyOptional)({
        description: 'Date when the reservation was cancelled (ISO string format)',
        example: '2024-02-10T10:30:00.000Z',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)({}, { message: 'Cancelled date must be a valid ISO date string' }),
    __metadata("design:type", String)
], UpdateReservationDto.prototype, "cancelledAt", void 0);
//# sourceMappingURL=update-reservation.dto.js.map