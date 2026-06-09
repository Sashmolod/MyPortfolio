import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { Request, Response } from 'express';
import { HttpStatus } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    login: jest.fn(),
    logout: jest.fn(),
    refreshTokens: jest.fn(),
    getCurrentUser: jest.fn(),
    createDefaultAdmin: jest.fn(),
    changePassword: jest.fn(),
  };

  const mockResponse = {
    cookie: jest.fn().mockReturnThis(),
    clearCookie: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    status: jest.fn().mockReturnThis(),
  } as unknown as Response;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should login user and set cookie', async () => {
      const loginDto: LoginDto = { username: 'admin', password: 'password' };
      const loginResult = {
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
        expiresIn: 3600,
        user: { id: 1, username: 'admin' },
      };
      mockAuthService.login.mockResolvedValue(loginResult);
      const mockReq = { ip: '127.0.0.1' } as Request;

      await controller.login(loginDto, mockReq, mockResponse);

      expect(mockAuthService.login).toHaveBeenCalledWith(loginDto);
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'AccessToken',
        'mock-access-token',
        expect.any(Object),
      );
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'RefreshToken',
        'mock-refresh-token',
        expect.any(Object),
      );
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Успешный вход',
        user: loginResult.user,
        accessToken: loginResult.accessToken,
        refreshToken: loginResult.refreshToken,
        expiresIn: loginResult.expiresIn,
      });
    });
  });

  describe('logout', () => {
    it('should clear cookies and return success', async () => {
      const mockReq = {
        user: { sub: '1' },
        cookies: { RefreshToken: 'some-token' },
        ip: '127.0.0.1',
      } as unknown as Request;
      mockAuthService.logout.mockResolvedValue(undefined);

      await controller.logout(mockReq, mockResponse);

      expect(mockAuthService.logout).toHaveBeenCalledWith(1, 'some-token');
      expect(mockResponse.cookie).toHaveBeenCalledWith('AccessToken', '', expect.any(Object));
      expect(mockResponse.cookie).toHaveBeenCalledWith('RefreshToken', '', expect.any(Object));
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Вы вышли из системы',
      });
    });
  });

  describe('refresh', () => {
    it('should refresh tokens and set new cookies', async () => {
      const mockReq = { cookies: { RefreshToken: 'old-refresh-token' } } as unknown as Request;
      const refreshResult = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
        expiresIn: 3600,
        user: { id: 1, username: 'admin' },
      };
      mockAuthService.refreshTokens.mockResolvedValue(refreshResult);

      await controller.refresh(mockReq, mockResponse);

      expect(mockAuthService.refreshTokens).toHaveBeenCalledWith('old-refresh-token');
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'AccessToken',
        'new-access-token',
        expect.any(Object),
      );
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'RefreshToken',
        'new-refresh-token',
        expect.any(Object),
      );
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Токены обновлены',
        accessToken: refreshResult.accessToken,
        refreshToken: refreshResult.refreshToken,
        expiresIn: refreshResult.expiresIn,
      });
    });

    it('should return 401 if refresh token is missing', async () => {
      const mockReq = { cookies: {} } as unknown as Request;

      await controller.refresh(mockReq, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Refresh token отсутствует',
      });
    });
  });

  describe('getMe', () => {
    it('should return logged in user info from service', async () => {
      const mockUser = { id: 1, username: 'admin' };
      const mockReq = { user: { sub: '1' } } as unknown as Request;
      mockAuthService.getCurrentUser.mockResolvedValue(mockUser);

      const result = await controller.getMe(mockReq);

      expect(mockAuthService.getCurrentUser).toHaveBeenCalledWith(1);
      expect(result).toEqual({ user: mockUser });
    });

    it('should throw error if user sub is missing', async () => {
      const mockReq = { user: {} } as unknown as Request;

      await expect(controller.getMe(mockReq)).rejects.toThrow('Пользователь не найден в токене');
    });
  });

  describe('createFirstAdmin', () => {
    it('should invoke service to create first admin', async () => {
      const loginDto: LoginDto = { username: 'admin', password: 'password' };
      const serviceResponse = { message: 'created', user: { id: 1 } };
      mockAuthService.createDefaultAdmin.mockResolvedValue(serviceResponse);

      const result = await controller.createFirstAdmin(loginDto);

      expect(mockAuthService.createDefaultAdmin).toHaveBeenCalledWith(loginDto);
      expect(result).toBe(serviceResponse);
    });
  });

  describe('changePassword', () => {
    it('should change user password', async () => {
      const changePasswordDto: ChangePasswordDto = { currentPassword: 'old', newPassword: 'new' };
      const mockReq = { user: { sub: '1' } } as unknown as Request;
      const serviceResponse = { message: 'changed' };
      mockAuthService.changePassword.mockResolvedValue(serviceResponse);

      const result = await controller.changePassword(mockReq, changePasswordDto);

      expect(mockAuthService.changePassword).toHaveBeenCalledWith(1, changePasswordDto);
      expect(result).toBe(serviceResponse);
    });

    it('should throw error if user sub is missing in changePassword', async () => {
      const changePasswordDto: ChangePasswordDto = { currentPassword: 'old', newPassword: 'new' };
      const mockReq = { user: {} } as unknown as Request;

      await expect(controller.changePassword(mockReq, changePasswordDto)).rejects.toThrow('Пользователь не найден в токене');
    });
  });
});
