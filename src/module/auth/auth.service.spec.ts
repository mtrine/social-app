import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserRepository } from '../users/user.repository';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { find } from 'rxjs';
import { create } from 'domain';
import { verify } from 'crypto';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import exp from 'constants';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { BadRequestException, ConflictException } from '@nestjs/common';
import { Response } from 'express';
import { IUser } from '../users/dto/user.interface';
import { mock } from 'node:test';
describe('AuthService', () => {
  let service: AuthService;
  let userRepository: UserRepository;
  let jwtService: JwtService;
  let configService: ConfigService;
  let cacheManager: Cache;

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
  const mockUserRepository = {
    findOneByEmail: jest.fn(),
    findOneByUsername: jest.fn(),
    findById: jest.fn(),
    create: jest.fn().mockResolvedValue(userData),
  }

  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
  }

  const mockConfigService = {
    get: jest.fn().mockImplementation((key: string) => {
      if (key === 'JWT_REFRESH_EXPIRE') return '7d';
      if(key === 'JWT_REFRESH_TOKEN_SECRET') return 'refresh_token_secret';
      return null;

    }),
  }

  const mockCacheManager = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
  }

  jest.mock('bcrypt')
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserRepository,
          useValue: mockUserRepository
        },
        {
          provide: JwtService,
          useValue: mockJwtService
        },
        {
          provide: ConfigService,
          useValue: mockConfigService
        },
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager
        }
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get<UserRepository>(UserRepository);
    jwtService = module.get<JwtService>(JwtService);
    configService = module.get<ConfigService>(ConfigService);
    cacheManager = module.get<Cache>(CACHE_MANAGER);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it(`should return user if user is valid`, async () => {
      // Mock userRepository.findOneByEmail để trả về dữ liệu người dùng hợp lệ
      (userRepository.findOneByEmail as jest.Mock).mockResolvedValue(userData);

      // Mock bcrypt.compare để luôn trả về true
      const hashSpy = jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);

      const email = 'qnhu1@gmail.com';
      const pass = 'password';

      const user = await service.validateUser(email, pass);
      const { password, ...expectedUser } = userData;
      // Kiểm tra kết quả trả về
      expect(user).toEqual(expectedUser);

      // Kiểm tra các hàm mock đã được gọi đúng
      expect(mockUserRepository.findOneByEmail).toHaveBeenCalledWith(email);
      expect(hashSpy).toHaveBeenCalledWith(pass, userData.password);
    });
    it(`should return null if user is invalid`, async () => {
      // Mock userRepository.findOneByEmail để trả về dữ liệu người dùng hợp lệ
      (userRepository.findOneByEmail as jest.Mock).mockResolvedValue(null);

      // Mock bcrypt.compare để luôn trả về false
      const hashSpy = jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);

      const email = 'qnhu1@gmail.com';
      const pass = 'password';

      const user = await service.validateUser(email, pass);
      expect(user).toBeNull();

    })
  });


  describe('register', () => {
    it('should return new user if email and username are not exist', async () => {

      const createUserDto = {
        email: 'test@gmail.com',
        username: 'test',
        password: 'password',
        name: 'Test User',
        gender: true,
      } as CreateUserDto;

      const newUser = await service.register(createUserDto);
      expect(newUser).toEqual(userData);
    });
    it('should throw an error if email already exists', async () => {
      // Dữ liệu đầu vào
      const createUserDto = {
        email: 'qnhu1@gmail.com',
        username: 'test',
        password: 'password',
        name: 'Test User',
        gender: true,
      } as CreateUserDto;
      mockUserRepository.create.mockRejectedValue(new ConflictException());
      // Thực thi hàm `register` và kiểm tra xem ngoại lệ có được ném ra
      await expect(service.register(createUserDto)).rejects.toThrow(ConflictException);
    });
  })

  describe('handleLogin', () => {
    it('should return access_token and set refresh_token cookie', async () => {
      const userLoginSuccess=  {
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
      }
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

      const response = {
        clearCookie: jest.fn(),
        cookie: jest.fn(),
      } as unknown as Response;

      const payload = {
        sub: 'token login',
        iss: 'from server',
        _id: userData._id,
        username: userData.username,
        name: userData.name,
        email: userData.email,
        bio: userData.bio,
        avatar: userData.avatar,
        gender: userData.gender,
      }

      const new_refresh_token = 'new_refresh_token';

      jest.spyOn(service, 'generateRefreshToken').mockReturnValue(new_refresh_token);
      (jwtService.sign as jest.Mock).mockReturnValue('access_token');
      const  userLogin = await service.handleLogin(user, response);
      expect(userLogin).toEqual(userLoginSuccess);
      // Verify calls
      expect(jwtService.sign).toHaveBeenCalledWith(payload);
      expect(service.generateRefreshToken).toHaveBeenCalledWith(payload);
      expect(cacheManager.set).toHaveBeenCalledWith(`refresh_token:${userData._id}`, new_refresh_token);

      // Verify cookies
      expect(response.clearCookie).toHaveBeenCalledWith('refresh_token');
      expect(response.cookie).toHaveBeenCalledWith('refresh_token', new_refresh_token, {
        httpOnly: true,
        secure: true,
        maxAge: expect.any(Number), // Mock maxAge dynamically
        sameSite: 'none',
      });

    })
  })

  describe('handleRefreshToken', () => {
    it('should return new access_token and set new refresh_token cookie', async () => {
      // Mock các phương thức
      (jwtService.verify as jest.Mock).mockResolvedValue(true); // Đúng cách mock verify
      (cacheManager.get as jest.Mock).mockResolvedValue('refresh_token');
      (userRepository.findById as jest.Mock).mockResolvedValue(userData);
  
      const new_refresh_token = 'new_refresh_token';
      jest.spyOn(service, 'generateRefreshToken').mockReturnValue(new_refresh_token);
      (jwtService.sign as jest.Mock).mockReturnValue('access_token');
  
      const response = {
        clearCookie: jest.fn(),
        cookie: jest.fn(),
      } as unknown as Response;
  
      const newPayload = {
        sub: 'token login',
        iss: 'from server',
        _id: userData._id,
        username: userData.username,
        name: userData.name,
        email: userData.email,
        bio: userData.bio,
        avatar: userData.avatar,
        gender: userData.gender,
      };
  
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
  
      // Gọi hàm handleRefreshToken
      const userRefresh = await service.handleRefreshToken('refresh_token', response);
      // Kiểm tra kết quả trả về
      expect(userRefresh).toEqual(userRefreshSuccess);
  
      // Kiểm tra các phương thức mock đã được gọi
      expect(jwtService.sign).toHaveBeenCalledWith(newPayload);
      expect(service.generateRefreshToken).toHaveBeenCalledWith(newPayload);
      expect(cacheManager.set).toHaveBeenCalledWith(`refresh_token:${userData._id}`, new_refresh_token);
  
      // Kiểm tra cookie
      expect(response.clearCookie).toHaveBeenCalledWith('refresh_token');
      expect(response.cookie).toHaveBeenCalledWith('refresh_token', new_refresh_token, {
        httpOnly: true,
        secure: true,
        maxAge: expect.any(Number), // Mock maxAge
        sameSite: 'none',
      });
    });
  });

  describe('handleLogout', () => {
    it('should return "ok" when logout success', async () => {
      const user = {
        _id: userData._id,
        email: userData.email,
        password: userData.password,
        name: userData.name,
        username: userData.username,
        avatar: userData.avatar,
        bio: userData.bio,
        gender: userData.gender
      } as unknown as IUser;

      const response = {
        clearCookie: jest.fn(),
      } as unknown as Response;

      const result = await service.handleLogout(user, response);

      expect(result).toEqual('ok');

      expect(cacheManager.del).toHaveBeenCalledWith(`refresh_token:${userData._id}`);
      expect(response.clearCookie).toHaveBeenCalledWith('refresh_token');
    })
  })

  describe('generateRefreshToken', () => {
    it('should return a refresh token', () => {
      (jwtService.sign as jest.Mock).mockReturnValue('refresh_token');

      const payload = {
        sub: 'token login',
        iss: 'from server',
        _id: userData._id,
        username: userData.username,
        name: userData.name,
        email: userData.email,
        bio: userData.bio,
        avatar: userData.avatar,
        gender: userData.gender,
      } 
      
      const refresh_token = service.generateRefreshToken(payload);
      expect(refresh_token).toEqual('refresh_token');
      expect(jwtService.sign).toHaveBeenCalledWith(payload, { expiresIn: '7d', secret: 'refresh_token_secret' });
      })
  })
});
