import { ConflictException } from "@nestjs/common";
import { CreateUserDto } from "./dto/create-user.dto";
import { UsersController } from "./users.controller";
import { Test, TestingModule } from "@nestjs/testing";
import { UsersService } from "./users.service";
import { UpdateUserDto } from "./dto/update-user.dto";

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

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
  };

  const mockUsersService = {
    create: jest.fn().mockResolvedValue(userData),
    update: jest.fn().mockResolvedValue(userData),
    remove: jest.fn().mockResolvedValue(userData),
    findOneByUsername: jest.fn().mockResolvedValue(userData),
    findOneByEmail: jest.fn().mockResolvedValue(userData),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
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
      expect(user).toEqual(userData);
    });

    it('should throw ConflictException if email already exists', async () => {
      const createUserDto = {
        email: 'test@gmail.com',
        username: 'test',
        password: 'password',
        name: 'Test User',
        gender: true,
      } as CreateUserDto;

      // Mocking the service to throw ConflictException
      mockUsersService.create.mockRejectedValueOnce(
        new ConflictException('Email already exists'),
      );

      await expect(controller.create(createUserDto)).rejects.toThrow(
        ConflictException,
      );
      expect(mockUsersService.create).toHaveBeenCalledWith(createUserDto);
    });
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
      })
  });

  describe('remove', () => {
    it('should remove a user', async () => {
      const user = await service.remove(userData._id);
      expect(user).toEqual(userData);
    })
  })

  describe('findOneByUsername', () => {
    it('should find a user by username', async () => {
      const user = await service.findOneByUsername(userData.username);
      expect(user).toEqual(userData);
    })
  })

  describe('findOneByEmail', () => {
    it('should find a user by email', async () => {
      const user = await service.findOneByEmail(userData.email);
      expect(user).toEqual(userData);
    })
  })
  
});
