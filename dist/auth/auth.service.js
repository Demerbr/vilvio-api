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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const users_service_1 = require("../users/users.service");
const bcrypt = require("bcryptjs");
let AuthService = class AuthService {
    constructor(usersService, jwtService) {
        this.usersService = usersService;
        this.jwtService = jwtService;
    }
    async validateUser(email, password) {
        try {
            const user = await this.usersService.findByEmail(email);
            if (!user) {
                return null;
            }
            const isPasswordValid = await bcrypt.compare(password, user.password || password);
            if (isPasswordValid) {
                const { password: _, ...result } = user;
                return result;
            }
            return null;
        }
        catch (error) {
            return null;
        }
    }
    async login(loginDto) {
        const user = await this.validateUser(loginDto.email, loginDto.password);
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        if (user.status !== 'ACTIVE') {
            throw new common_1.UnauthorizedException('Account is not active');
        }
        const payload = {
            sub: user.id,
            email: user.email,
            userType: user.userType,
        };
        const access_token = this.jwtService.sign(payload);
        await this.usersService.updateLastActivity(user.id);
        return {
            user,
            access_token,
            token_type: 'Bearer',
            expires_in: '7d',
        };
    }
    async register(registerDto) {
        const existingUser = await this.usersService.findByEmail(registerDto.email);
        if (existingUser) {
            throw new common_1.ConflictException('User with this email already exists');
        }
        if (registerDto.userType === 'STUDENT' && (!registerDto.age || registerDto.age < 5)) {
            throw new common_1.BadRequestException('Students must be at least 5 years old');
        }
        const hashedPassword = await bcrypt.hash(registerDto.password, 12);
        const userData = {
            ...registerDto,
            password: hashedPassword,
        };
        const user = await this.usersService.create(userData);
        const { password: _, ...userWithoutPassword } = user;
        const payload = {
            sub: user.id,
            email: user.email,
            userType: user.userType,
        };
        const access_token = this.jwtService.sign(payload);
        return {
            user: userWithoutPassword,
            access_token,
            token_type: 'Bearer',
            expires_in: '7d',
        };
    }
    async validateJwtPayload(payload) {
        const user = await this.usersService.findOne(payload.sub);
        if (!user) {
            throw new common_1.UnauthorizedException('User not found');
        }
        if (user.status !== 'ACTIVE') {
            throw new common_1.UnauthorizedException('Account is not active');
        }
        const { password: _, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }
    async refreshToken(user) {
        const payload = {
            sub: user.id,
            email: user.email,
            userType: user.userType,
        };
        return {
            access_token: this.jwtService.sign(payload),
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map