import { CreateReservationDto } from './create-reservation.dto';
declare enum ReservationStatus {
    PENDING = "PENDING",
    READY = "READY",
    FULFILLED = "FULFILLED",
    CANCELLED = "CANCELLED",
    EXPIRED = "EXPIRED"
}
declare const UpdateReservationDto_base: import("@nestjs/common").Type<Partial<CreateReservationDto>>;
export declare class UpdateReservationDto extends UpdateReservationDto_base {
    status?: ReservationStatus;
    fulfilledAt?: string;
    cancelledAt?: string;
}
export {};
