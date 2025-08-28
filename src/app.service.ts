import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): object {
    return {
      message: 'Vivilo API is running!',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    };
  }

  getHealth(): object {
    return {
      status: 'OK',
      message: 'Vivilo Library Management System API',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      database: 'PostgreSQL with Prisma ORM',
      features: [
        'Book Management',
        'User Management',
        'Loan System',
        'Reservation System',
        'Category Management',
        'Institution Management',
        'Authentication & Authorization',
        'Fine Management',
      ],
    };
  }
}