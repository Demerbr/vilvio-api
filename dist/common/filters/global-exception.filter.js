"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var GlobalExceptionFilter_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GlobalExceptionFilter = void 0;
const common_1 = require("@nestjs/common");
const library_1 = require("@prisma/client/runtime/library");
let GlobalExceptionFilter = GlobalExceptionFilter_1 = class GlobalExceptionFilter {
    constructor() {
        this.logger = new common_1.Logger(GlobalExceptionFilter_1.name);
    }
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        let status = common_1.HttpStatus.INTERNAL_SERVER_ERROR;
        let message = 'Internal server error';
        let error = 'Internal Server Error';
        let details = null;
        if (exception instanceof common_1.HttpException) {
            status = exception.getStatus();
            const exceptionResponse = exception.getResponse();
            if (typeof exceptionResponse === 'object') {
                message = exceptionResponse.message || exception.message;
                error = exceptionResponse.error || exception.name;
                details = exceptionResponse.details || null;
            }
            else {
                message = exceptionResponse;
                error = exception.name;
            }
        }
        else if (exception instanceof library_1.PrismaClientKnownRequestError) {
            status = common_1.HttpStatus.BAD_REQUEST;
            error = 'Database Error';
            switch (exception.code) {
                case 'P2002':
                    status = common_1.HttpStatus.CONFLICT;
                    message = 'Unique constraint violation';
                    details = {
                        field: exception.meta?.target,
                        code: exception.code,
                    };
                    break;
                case 'P2025':
                    status = common_1.HttpStatus.NOT_FOUND;
                    message = 'Record not found';
                    details = {
                        code: exception.code,
                    };
                    break;
                case 'P2003':
                    status = common_1.HttpStatus.BAD_REQUEST;
                    message = 'Foreign key constraint violation';
                    details = {
                        field: exception.meta?.field_name,
                        code: exception.code,
                    };
                    break;
                case 'P2014':
                    status = common_1.HttpStatus.BAD_REQUEST;
                    message = 'Invalid ID provided';
                    details = {
                        code: exception.code,
                    };
                    break;
                default:
                    message = 'Database operation failed';
                    details = {
                        code: exception.code,
                        meta: exception.meta,
                    };
            }
        }
        else if (exception instanceof library_1.PrismaClientValidationError) {
            status = common_1.HttpStatus.BAD_REQUEST;
            error = 'Validation Error';
            message = 'Invalid data provided';
            details = {
                type: 'PrismaClientValidationError',
            };
        }
        else if (exception instanceof Error) {
            message = exception.message;
            error = exception.name;
            if (exception.name === 'ValidationError') {
                status = common_1.HttpStatus.BAD_REQUEST;
                error = 'Validation Error';
            }
            else if (exception.name === 'UnauthorizedError') {
                status = common_1.HttpStatus.UNAUTHORIZED;
                error = 'Unauthorized';
            }
            else if (exception.name === 'ForbiddenError') {
                status = common_1.HttpStatus.FORBIDDEN;
                error = 'Forbidden';
            }
        }
        const errorLog = {
            timestamp: new Date().toISOString(),
            path: request.url,
            method: request.method,
            status,
            error,
            message,
            details,
            userAgent: request.get('User-Agent'),
            ip: request.ip,
        };
        if (status >= 500) {
            this.logger.error('Server Error:', errorLog);
            if (exception instanceof Error) {
                this.logger.error(exception.stack);
            }
        }
        else {
            this.logger.warn('Client Error:', errorLog);
        }
        const errorResponse = {
            success: false,
            timestamp: new Date().toISOString(),
            path: request.url,
            method: request.method,
            status,
            error,
            message,
            ...(details && { details }),
            ...(process.env.NODE_ENV === 'development' && {
                stack: exception instanceof Error ? exception.stack : undefined,
            }),
        };
        response.status(status).json(errorResponse);
    }
};
exports.GlobalExceptionFilter = GlobalExceptionFilter;
exports.GlobalExceptionFilter = GlobalExceptionFilter = GlobalExceptionFilter_1 = __decorate([
    (0, common_1.Catch)()
], GlobalExceptionFilter);
//# sourceMappingURL=global-exception.filter.js.map