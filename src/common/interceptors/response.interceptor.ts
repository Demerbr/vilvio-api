import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Request } from 'express';

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

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    const request = context.switchToHttp().getRequest<Request>();
    
    return next.handle().pipe(
      map((data) => {
        // Handle paginated responses
        if (data && typeof data === 'object' && 'data' in data && 'meta' in data) {
          return {
            success: true,
            timestamp: new Date().toISOString(),
            path: request.url,
            method: request.method,
            data: data.data,
            meta: data.meta,
            message: data.message || 'Request successful',
          };
        }

        // Handle regular responses
        return {
          success: true,
          timestamp: new Date().toISOString(),
          path: request.url,
          method: request.method,
          data,
          message: 'Request successful',
        };
      }),
    );
  }
}