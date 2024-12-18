import { Test, TestingModule } from '@nestjs/testing';
import { PostsService } from './posts.service';
import { PostsRepository } from './posts.repository';
import { CreatePostDto } from './dto/create-post.dto';
import exp from 'constants';
import { count } from 'console';

describe('PostsService', () => {
  let service: PostsService;
  let postsRepository: PostsRepository;

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
  const mockPostsRepository = {
    createPost: jest.fn().mockResolvedValue(postData),
    deletePost: jest.fn(),
    getMyPosts: jest.fn().mockResolvedValue(postData),
    getMixedNewsfeed: jest.fn().mockResolvedValue(postData),
    createComment: jest.fn().mockResolvedValue(postData),
    countDocuments: jest.fn().mockResolvedValue(1)
  }
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostsService,
        {
          provide: PostsRepository,
          useValue: mockPostsRepository
        }

      ],
    }).compile();

    service = module.get<PostsService>(PostsService);
    postsRepository = module.get<PostsRepository>(PostsRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createPost', () => {
    it('should create a post', async () => {
      const createPostDto = {
        authorId: '1',
        content: 'Test content',
        media:[]
      } as CreatePostDto;
      const result = await service.create(createPostDto);
      expect(result).toEqual(postData);
      expect(mockPostsRepository.createPost).toHaveBeenCalledWith(createPostDto);
    })
  });

  describe('getMyPosts', () => {
    it('should get my posts', async () => {
      const userId = '676261a62162b33d39f98b02';
      const qs = {
        limit: 10,
        currentPage: 1
      }
      const result = await service.getMyPosts(userId, qs);
      expect(result.data).toEqual(postData);
      expect(mockPostsRepository.getMyPosts).toHaveBeenCalledWith(userId, 10, 0);
    })
  })

  describe('getMixedNewsfeed', () => {
    it('should get mixed newsfeed', async () => {

      const userId = '676261a62162b33d39f98b02';
      const qs = {
        limit: 10,
        currentPage: 1
      }
      const result = await service.getMyNewsfeed(userId, qs);
      expect(result.data).toEqual(postData);
    })
  })

  describe('createComment', () => {
    it('should create a comment', async () => {
      const postId = '676261a62162b33d39f98b02';
      const userId = '676261a62162b33d39f98b02';
      const comment = 'Test comment';
      const result = await service.createComment(postId, userId, comment);
      expect(result).toEqual(postData);
    })
  })
});
