# Vivilo API - Library Management System

A comprehensive NestJS-based REST API for library management system with features for managing books, users, loans, reservations, categories, and institutions.

## Features

- **User Management**: Registration, authentication, and user profiles with different user types (Student, Teacher, Public)
- **Book Management**: CRUD operations for books with search, filtering, and availability tracking
- **Loan System**: Book borrowing with due dates, renewals, and overdue tracking
- **Reservation System**: Book reservation with queue management
- **Category Management**: Organize books by categories
- **Institution Management**: Manage educational institutions
- **Fine Management**: Automatic fine calculation for overdue books
- **JWT Authentication**: Secure API endpoints with JWT tokens
- **Swagger Documentation**: Interactive API documentation
- **Database Integration**: PostgreSQL with Prisma ORM

## Tech Stack

- **Framework**: NestJS
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: class-validator
- **Documentation**: Swagger/OpenAPI
- **Password Hashing**: bcryptjs
- **Configuration**: @nestjs/config

## Prerequisites

- Node.js (v16 or higher)
- PostgreSQL database
- npm or yarn

## Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd vivilo-api
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Environment Setup**:
   Copy the `.env` file and update the database connection string and other configurations:
   ```bash
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/vivilo_db"
   
   # JWT Configuration
   JWT_SECRET="your-super-secret-jwt-key"
   JWT_REFRESH_SECRET="your-super-secret-refresh-key"
   JWT_EXPIRES_IN="1h"
   JWT_REFRESH_EXPIRES_IN="7d"
   
   # Application
   PORT=3000
   NODE_ENV="development"
   CORS_ORIGINS="http://localhost:3000,http://localhost:3001"
   
   # Library Configuration
   FINE_PER_DAY=1.0
   LOAN_DURATION_DAYS=14
   RESERVATION_DURATION_DAYS=7
   MAX_RENEWALS=2
   
   # User Limits
   MAX_LOANS_STUDENT=3
   MAX_LOANS_TEACHER=10
   MAX_LOANS_PUBLIC=2
   MAX_RESERVATIONS_STUDENT=2
   MAX_RESERVATIONS_TEACHER=5
   MAX_RESERVATIONS_PUBLIC=1
   ```

4. **Database Setup**:
   ```bash
   # Generate Prisma client
   npx prisma generate
   
   # Run database migrations
   npx prisma db push
   
   # (Optional) Seed the database
   npx prisma db seed
   ```

5. **Start the application**:
   ```bash
   # Development mode
   npm run start:dev
   
   # Production mode
   npm run build
   npm run start:prod
   ```

## API Documentation

Once the application is running, you can access the Swagger documentation at:
```
http://localhost:3000/api/docs
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `GET /api/v1/auth/profile` - Get user profile
- `POST /api/v1/auth/refresh` - Refresh access token

### Users
- `GET /api/v1/users` - Get all users (with pagination)
- `GET /api/v1/users/:id` - Get user by ID
- `POST /api/v1/users` - Create new user
- `PATCH /api/v1/users/:id` - Update user
- `DELETE /api/v1/users/:id` - Delete user
- `GET /api/v1/users/statistics` - Get user statistics

### Books
- `GET /api/v1/books` - Get all books (with pagination and search)
- `GET /api/v1/books/:id` - Get book by ID
- `POST /api/v1/books` - Create new book
- `PATCH /api/v1/books/:id` - Update book
- `DELETE /api/v1/books/:id` - Delete book
- `GET /api/v1/books/available` - Get available books
- `GET /api/v1/books/popular` - Get popular books
- `GET /api/v1/books/statistics` - Get book statistics

### Loans
- `GET /api/v1/loans` - Get all loans
- `GET /api/v1/loans/:id` - Get loan by ID
- `POST /api/v1/loans` - Create new loan (borrow book)
- `PATCH /api/v1/loans/:id/return` - Return book
- `PATCH /api/v1/loans/:id/renew` - Renew loan
- `GET /api/v1/loans/overdue` - Get overdue loans
- `GET /api/v1/loans/statistics` - Get loan statistics

### Reservations
- `GET /api/v1/reservations` - Get all reservations
- `GET /api/v1/reservations/:id` - Get reservation by ID
- `POST /api/v1/reservations` - Create new reservation
- `PATCH /api/v1/reservations/:id/cancel` - Cancel reservation
- `PATCH /api/v1/reservations/:id/fulfill` - Fulfill reservation
- `GET /api/v1/reservations/statistics` - Get reservation statistics

### Categories
- `GET /api/v1/categories` - Get all categories
- `GET /api/v1/categories/:id` - Get category by ID
- `POST /api/v1/categories` - Create new category
- `PATCH /api/v1/categories/:id` - Update category
- `DELETE /api/v1/categories/:id` - Delete category

### Institutions
- `GET /api/v1/institutions` - Get all institutions
- `GET /api/v1/institutions/:id` - Get institution by ID
- `POST /api/v1/institutions` - Create new institution
- `PATCH /api/v1/institutions/:id` - Update institution
- `DELETE /api/v1/institutions/:id` - Delete institution

## Database Schema

The application uses the following main entities:

- **User**: System users (students, teachers, public)
- **Book**: Library books with availability tracking
- **Loan**: Book borrowing records
- **Reservation**: Book reservation queue
- **Category**: Book categorization
- **Institution**: Educational institutions

## Business Rules

### Loan Limits
- Students: 3 active loans
- Teachers: 10 active loans
- Public users: 2 active loans

### Reservation Limits
- Students: 2 active reservations
- Teachers: 5 active reservations
- Public users: 1 active reservation

### Loan Duration
- Default: 14 days
- Maximum renewals: 2 times
- Fine: $1.00 per day for overdue books

### Reservation Duration
- Default: 7 days to pick up reserved books
- Automatic expiry after the duration

## Development

### Running Tests
```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

### Code Quality
```bash
# Linting
npm run lint

# Formatting
npm run format
```

### Database Operations
```bash
# Reset database
npx prisma db push --force-reset

# View database in Prisma Studio
npx prisma studio

# Generate new migration
npx prisma migrate dev --name migration_name
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Ensure all tests pass
6. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue in the repository or contact the development team.