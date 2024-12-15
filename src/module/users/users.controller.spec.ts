import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { create } from 'domain';

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
  }

  const mockUsersService = {
    create: jest.fn().mockResolvedValue(userData),
    update: jest.fn().mockResolvedValue(userData),
    remove: jest.fn().mockResolvedValue(userData),
    findOneByUsername: jest.fn().mockResolvedValue(userData),
    findOneByEmail: jest.fn().mockResolvedValue(userData),
  }
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService
        }
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
