import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { UserRepository } from './user.repository';
import { mock } from 'node:test';
import { CreateUserDto } from './dto/create-user.dto';
import { BadRequestException, ConflictException } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { find } from 'rxjs';

describe('UsersService', () => {
  let service: UsersService;
  let userRepository: UserRepository;
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
    create: jest.fn().mockResolvedValue(userData),
    updateById: jest.fn().mockResolvedValue(userData),
    deleteById: jest.fn().mockResolvedValue(userData), 
    findOneByUsername: jest.fn().mockResolvedValue(userData),
    findOneByEmail: jest.fn().mockResolvedValue(userData),
    searchByUsername: jest.fn().mockResolvedValue([userData]),
    countDocuments: jest.fn().mockResolvedValue(1), 
    findById: jest.fn().mockResolvedValue({
      ...userData,
      save: jest.fn().mockResolvedValue(userData), // Mock save
    }),
    
  }
  const mockCacheManager = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UserRepository,
          useValue: mockUserRepository
        },
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager
        }
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userRepository = module.get<UserRepository>(UserRepository);
    cacheManager = module.get<Cache>(CACHE_MANAGER);

  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a user', async () => {
      const createUserDto = {
        email: 'test@gmail.com',
        username: 'test',
        password: 'password',
        name: 'Test User',
        gender: true,
      } as CreateUserDto;
      const user = await service.create(createUserDto);
      (mockCacheManager.del as jest.Mock).mockResolvedValueOnce(null);
      expect(user).toEqual(userData);
    });
    it('should create a user with email exist', async () => {
      const createUserDto = {
        email: 'qnhu1@gmail.com',
        username: 'test',
        password: 'password',
        name: 'Test User',
        gender: true,
      } as CreateUserDto;
      const duplicateKeyError = new ConflictException();
      (duplicateKeyError as any).code = 11000; // Đặt code là 11000 để mô phỏng lỗi MongoDB
      mockUserRepository.create.mockRejectedValueOnce(duplicateKeyError);
      const result = service.create(createUserDto);
      expect(result).rejects.toThrow(ConflictException);
    })
  });

  describe('update', () => {
    it('should update a user', async () => {
      const updateUserDto = {
        email: 'qnhu1@gmail.com',
        username: 'test',
        password: 'password',
        name: 'Test User',
        gender: true,
        } as UpdateUserDto;
      const user = await service.update(userData._id, updateUserDto);
      expect(user).toEqual(userData);
      }
    )
  })

  describe('remove', () => {
    it('should remove a user', async () => {
      
      const user = await service.remove(userData._id);
      expect(mockUserRepository.deleteById).toHaveBeenCalledWith(userData._id); 
      expect(user).toEqual(userData);
    });
  })

  describe('findOneByUsername', () => {
    it('should find a user by username', async () => {
      const user = await service.findOneByUsername(userData.username);
      expect(user).toEqual(userData);
    });
    it('should throw an error if user not found', async () => {
      mockUserRepository.findOneByUsername.mockResolvedValueOnce(null);
      const result = service.findOneByUsername('test');
      expect(result).rejects.toThrow(BadRequestException)
    });
  })

  describe('findOneByEmail', () => {
    it('should find a user by email', async () => {
      const user = await service.findOneByEmail(userData.email);
      expect(user).toEqual(userData);
    });

    it('should throw an error if user not found', async () => {
      mockUserRepository.findOneByEmail.mockResolvedValueOnce(null);
      const result = service.findOneByEmail(userData.email)
      expect(result).rejects.toThrow(BadRequestException)
    })
  })

  describe('searchByUsername', () => {
    it('should search users by username', async () => {
      const result = await service.searchByUsername('qnhu1', { limit: 10, currentPage: 1 }) as { data: typeof userData[] };
      expect(result.data).toEqual([userData]);
    });
  })

  describe('follow user',()=>{
    it('should follow a user',async()=>{
      const userFollowed = {
        _id: '675512d24dd69ef1b4c17417'
      }

      const result = await service.followUser(userFollowed._id, userData._id);

      const sanitizedResult = { ...result, save: undefined };
    
      expect(sanitizedResult).toEqual(userData);
    })
  })
});
