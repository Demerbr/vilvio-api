import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
export declare class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    private configService;
    private readonly logger;
    constructor(configService: ConfigService);
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
    executeTransaction<T>(fn: (prisma: PrismaService) => Promise<T>): Promise<T>;
    softDelete(model: string, id: number): Promise<any>;
    healthCheck(): Promise<boolean>;
}
