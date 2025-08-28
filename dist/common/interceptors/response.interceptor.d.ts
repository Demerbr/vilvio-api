import { NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
export interface ApiResponse<T> {
    success: boolean;
    timestamp: string;
    path: string;
    method: string;
    data: T;
    message?: string;
    meta?: {
        total?: number;
        page?: number;
        limit?: number;
        totalPages?: number;
    };
}
export declare class ResponseInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
    intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>>;
}
