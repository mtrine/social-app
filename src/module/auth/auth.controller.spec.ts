import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { UserRepository } from '../users/user.repository'; // Import UserRepository
import { Request, Response, response } from 'express';
import { IUser } from '../users/dto/user.interface';
import { CreateUserDto } from '../users/dto/create-user.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const userData = {
    _id: '675512d24dd69ef1b4c17416',
    email: 'qnhu1@gmail.com',
    password: 'hashPassword',
    name: 'NguyenNgocQuynhNhu',
    username: 'qnhu1',
    avatar: '',
    bio: '',
    gender: false,
    followers: [],
    following: [],
    DeleteAt: null,
    createdAt: `2024-12-08T03:30:26.960Z`,
    updatedAt: `2024-12-08T03:30:26.960Z`,
  }
  
  const mockAuthService={
    handleLogin: jest.fn(),
    handleRefreshToken: jest.fn(),
    handleLogout: jest.fn(),
    register: jest.fn(),
  }
  
  
  beforeEach(async () => {
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
    it('should return an object with access_token and user data', async () => {
      const userLoginSuccess = {
        access_token: 'access_token',
        user: {
          _id: '675512d24dd69ef1b4c17416',
          username: 'qnhu1',
          name: 'NguyenNgocQuynhNhu',
          email: 'qnhu1@gmail.com',
          bio: '',
          avatar: '',
          gender: false,
        },
      };
      const user = {
        _id: userData._id,
        email: userData.email,
        password: userData.password,
        name: userData.name,
        username: userData.username,
        avatar: userData.avatar,
        bio: userData.bio,
        gender:false,
      } as unknown as IUser;

      mockAuthService.handleLogin.mockResolvedValue(userLoginSuccess);
      
      // Truyền tham số vào controller và nhận kết quả
      const result = await controller.login(user, response);
  
      expect(result.access_token).toBe('access_token');
      expect(result.user).toEqual(userLoginSuccess.user);
    });
  });

  describe('refreshToken', () => {
    it('should return an object with access_token and user data', async () => {
      const response = {
        clearCookie: jest.fn(),
        cookie: jest.fn(),
      } as unknown as Response;
      const userRefreshSuccess = {
        access_token: 'access_token',
        user: {
          _id: '675512d24dd69ef1b4c17416',
          username: 'qnhu1',
          name: 'NguyenNgocQuynhNhu',
          email: 'qnhu1@gmail.com',
          bio: '',
          avatar: '',
          gender: false,
        },
      };
  
      (mockAuthService.handleRefreshToken as jest.Mock).mockResolvedValue(userRefreshSuccess);
  
      const request = {
        cookies: {
          refresh_token: 'refresh_token', // Giá trị mock phù hợp
        },
      } as any;
  
      const result = await controller.refreshToken(request, response);
  
      expect(result.access_token).toBe('access_token');
      expect(result.user).toEqual(userRefreshSuccess.user);
    });

    
  });
  
  describe('logout', () => {
    it('should return an object with message', async () => {
      const response = {
        clearCookie: jest.fn(),
      } as unknown as Response;
     
  
      const user = {
        _id: userData._id,
        email: userData.email,
        password: userData.password,
        name: userData.name,
        username: userData.username,
        avatar: userData.avatar,
        bio: userData.bio,
        gender:false,
      } as unknown as IUser;

      (mockAuthService.handleLogout as jest.Mock).mockResolvedValue('ok');
  
      const result = await controller.logout(user, response);
  
      expect(result).toBe('ok');
    });
  })

  describe('register', () => {
    it('should return an object user data', async () => {
      const createUserDto = {
        email: 'test@gmail.com',
        username: 'test',
        password: 'password',
        name: 'Test User',
        gender: true,
      } as CreateUserDto;
      (mockAuthService.register as jest.Mock).mockResolvedValue(userData);
      const result = await controller.register(createUserDto);
      expect(result).toEqual(userData);

      })
  })
});
