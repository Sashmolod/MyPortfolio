import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { AuthService, AuthPayload } from './auth.service';
import { UserService } from './user.service';
import { JwtBlacklist } from './entities/jwt-blacklist.entity';
import { User } from './entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UnauthorizedException, ConflictException } from '@nestjs/common';

// Mock bcrypt
jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let userService: UserService;
  let jwtService: JwtService;
  let configService: ConfigService;
  let blacklistRepository: Repository<JwtBlacklist>;

  const mockUser: User = {
    id: 1,
    username: 'admin',
    password: '$2a$12$hashedpassword',
    isActive: true,
    loginAttempts: 0,
    lockoutUntil: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  const mockConfigService: ConfigService = {
    get: jest.fn((key: string) => {
      const config = {
        JWT_SECRET: 'test-secret-key-for-testing-purposes-123456',
        JWT_EXPIRES_IN: '1h',
        JWT_REFRESH_SECRET: 'test-refresh-secret-key-for-testing-123456',
        JWT_REFRESH_EXPIRES_IN: '7d',
      };
      return config[key as keyof typeof config];
    }),
  } as unknown as ConfigService;

  const mockJwtService = {
    sign: jest.fn((payload: any, options?: any) => {
      const jti = options?.jwtid || `test_${Date.now()}`;
      return `mock_token_${jti}`;
    }),
    verify: jest.fn((token: string, options?: any) => {
      if (token === 'valid_refresh_token') {
        return { sub: '1', username: 'admin', type: 'refresh', jti: 'ref_1_123', exp: Date.now() / 1000 + 604800 };
      }
      if (token === 'access_token') {
        return { sub: '1', username: 'admin', type: 'access', jti: 'acc_1_123' };
      }
      if (token === 'expired_token') {
        return { sub: '1', username: 'admin', type: 'refresh', jti: 'ref_1_old', exp: Date.now() / 1000 - 1000 };
      }
      throw new Error('Invalid token');
    }),
  };

  const mockUserService = {
    findByUsername: jest.fn(),
    findById: jest.fn(),
    findByIdWithPassword: jest.fn(),
    createDefaultAdmin: jest.fn(),
    update: jest.fn(),
    incrementLoginAttempts: jest.fn().mockResolvedValue(undefined),
    resetLoginAttempts: jest.fn().mockResolvedValue(undefined),
  };

  const mockBlacklistRepository = {
    findOne: jest.fn(),
    delete: jest.fn().mockResolvedValue(undefined),
    create: jest.fn((data: any) => data),
    save: jest.fn(async (data: any) => data),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserService, useValue: mockUserService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
        {
          provide: getRepositoryToken(JwtBlacklist),
          useValue: mockBlacklistRepository,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    jwtService = module.get<JwtService>(JwtService);
    configService = module.get<ConfigService>(ConfigService);
    blacklistRepository = module.get<Repository<JwtBlacklist>>(getRepositoryToken(JwtBlacklist));
  });

  describe('login', () => {
    it('should return auth payload with valid credentials', async () => {
      const dto: LoginDto = { username: 'admin', password: 'correctpassword' };
      mockUserService.findByUsername.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result: AuthPayload = await service.login(dto);

      expect(result).toMatchObject({
        user: {
          id: 1,
          username: 'admin',
          isActive: true,
        },
        expiresIn: 3600,
      });
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      expect(mockUserService.findByUsername).toHaveBeenCalledWith('admin');
      expect(bcrypt.compare).toHaveBeenCalledWith('correctpassword', mockUser.password);
    });

    it('should throw UnauthorizedException for non-existent user', async () => {
      const dto: LoginDto = { username: 'unknown', password: 'password' };
      mockUserService.findByUsername.mockResolvedValue(null);

      await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
      await expect(service.login(dto)).rejects.toThrow('Неверный логин или пароль');
    });

    it('should throw UnauthorizedException for invalid password', async () => {
      const dto: LoginDto = { username: 'admin', password: 'wrongpassword' };
      mockUserService.findByUsername.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
      await expect(service.login(dto)).rejects.toThrow('Неверный логин или пароль');
    });

    it('should throw UnauthorizedException for inactive user', async () => {
      const dto: LoginDto = { username: 'admin', password: 'correctpassword' };
      const inactiveUser = { ...mockUser, isActive: false };
      mockUserService.findByUsername.mockResolvedValue(inactiveUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
      await expect(service.login(dto)).rejects.toThrow('Неверный логин или пароль');
    });
  });

  describe('refreshTokens', () => {
    it('should return new tokens with valid refresh token', async () => {
      mockUserService.findById.mockResolvedValue(mockUser);
      mockBlacklistRepository.findOne.mockResolvedValue(null);

      const result: AuthPayload = await service.refreshTokens('valid_refresh_token');

      expect(result).toMatchObject({
        user: {
          id: 1,
          username: 'admin',
          isActive: true,
        },
        expiresIn: 3600,
      });
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      expect(mockJwtService.verify).toHaveBeenCalledWith('valid_refresh_token', expect.any(Object));
    });

    it('should throw UnauthorizedException for invalid token', async () => {
      await expect(service.refreshTokens('invalid_token')).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for access token passed as refresh', async () => {
      await expect(service.refreshTokens('access_token')).rejects.toThrow(UnauthorizedException);
      await expect(service.refreshTokens('access_token')).rejects.toThrow('Неверный тип токена');
    });

    it('should throw UnauthorizedException for blacklisted token', async () => {
      mockBlacklistRepository.findOne.mockResolvedValue({ jti: 'ref_1_123', expiresAt: new Date() });

      await expect(service.refreshTokens('valid_refresh_token')).rejects.toThrow(UnauthorizedException);
      await expect(service.refreshTokens('valid_refresh_token')).rejects.toThrow('Токен недействителен');
    });
  });
});