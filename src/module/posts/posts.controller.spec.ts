import { Test, TestingModule } from '@nestjs/testing';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { IUser } from '../users/dto/user.interface';

describe('PostsController', () => {
  let controller: PostsController;
  let postsService: PostsService;



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

  const postData = {
    _id: "676261a62162b33d39f98b02",
    authorId: "675512d24dd69ef1b4c17416",
    content: "Hom nay toi buon",
    media: [],
    likes: [],
    comments: [],
    createdAt: "2024-12-18T05:46:14.517Z",
    updatedAt: "2024-12-18T05:46:14.517Z",
    isDeleted: false
  }
  const mockPostsService = {
    create: jest.fn().mockResolvedValue(postData),
    getMyPosts: jest.fn().mockResolvedValue(postData),
    getMyNewsfeed: jest.fn().mockResolvedValue(postData),
    createComment: jest.fn().mockResolvedValue(postData)
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostsController],
      providers: [{
        provide: PostsService,
        useValue: mockPostsService
      }],
    }).compile();

    controller = module.get<PostsController>(PostsController);
    postsService = module.get<PostsService>(PostsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a post', async () => {
      const createPostDto = {
        authorId: '1',
        content: 'Test content',
        media: []
      }
      const result = await controller.create(createPostDto);
      expect(result).toEqual(postData);
      expect(postsService.create).toHaveBeenCalledWith(createPostDto);
    })
  })

  describe('getMyPosts', () => {
    it('should get my posts', async () => {
      const user = {
        _id: userData._id,
        email: userData.email,
        password: userData.password,
        name: userData.name,
        username: userData.username,
        avatar: userData.avatar,
        bio: userData.bio,
        gender: false,
      } as unknown as IUser;
      const qs = {
        limit: 10,
        currentPage: 1
      }
      const result = await controller.getMyPosts(user, qs);
      expect(result).toEqual(postData);
      expect(postsService.getMyPosts).toHaveBeenCalledWith(user._id, qs);
    })
  })

  describe('getMyNewsfeed', () => {
    it('should get my newsfeed', async () => {
      const user = {
        _id: userData._id,
        email: userData.email,
        password: userData.password,
        name: userData.name,
        username: userData.username,
        avatar: userData.avatar,
        bio: userData.bio,
        gender: false,
      } as unknown as IUser;
      const qs = {
        limit: 10,
        currentPage: 1
      }
      const result = await controller.getMyNewsfeed(user, qs);
      expect(result).toEqual(postData);
      expect(postsService.getMyNewsfeed).toHaveBeenCalledWith(user._id, qs);
    })
  })

  describe('createComment', () => {
    it('should create a comment', async () => {
      const user = {
        _id: userData._id,
        email: userData.email,
        password: userData.password,
        name: userData.name,
        username: userData.username,
        avatar: userData.avatar,
        bio: userData.bio,
        gender: false,
      } as unknown as IUser;
      const postId = '676261a62162b'
      const comment = 'Test comment';
      const result = await controller.createComment(user, postId, comment);
      expect(result).toEqual(postData);
      expect(postsService.createComment).toHaveBeenCalledWith(postId, user._id, comment);
      })
  })
});
