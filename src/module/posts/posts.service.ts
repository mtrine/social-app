import { Injectable } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostsRepository } from './posts.repository';
import { plainToClass } from 'class-transformer';
import { MetaResponseDto } from 'src/core/meta-response';
import { PostListResponseDto } from './dto/post-response.dto';
import { Types } from 'mongoose';

@Injectable()
export class PostsService {
  constructor(
    private postsRepository: PostsRepository,
  ) {}
  async create(createPostDto: CreatePostDto) {
    return await this.postsRepository.createPost(createPostDto);
  }

  async getMyPosts(userId: string,qs: any) {
    const take = +qs.limit || undefined
    const skip = (+qs.currentPage - 1) * (+qs.limit) || 0
    const defaultLimit = +qs.limit ? +qs.limit : 10
   
    const totalItems = await this.postsRepository.countDocuments({ authorId: userId, isDelete: false });
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const metaResponseDto = plainToClass(MetaResponseDto, {
      current: +qs.currentPage || 1,
      pageSize: take,
      pages: totalPages,
      total:totalItems
    });

    const result = await this.postsRepository.getMyPosts(userId,take,skip);

    const postListResponse = plainToClass(PostListResponseDto, {
      meta: metaResponseDto,
      data: result
    });
    return postListResponse;
  }

  async createComment(postId: string,userId:string,  comment: any) {
    return await this.postsRepository.createComment(postId, userId ,comment);
  }

  async getMyNewsfeed(userId: string, qs: any) {  
    const take = +qs.limit || 20
    const skip = (+qs.currentPage - 1) * (+qs.limit) || 0
    const defaultLimit = +qs.limit ? +qs.limit : 10

    const totalItems = await this.postsRepository.countDocuments([
        // Match bài viết không bị soft delete
        { $match: { isDeleted: false } },

        // Option 1: Lấy bài viết từ người bạn theo dõi
        {
            $lookup: {
                from: 'users', // Collection User
                localField: 'authorId',
                foreignField: '_id',
                as: 'author',
            },
        },
        {
            $match: {
                'author.following': { $in: [new Types.ObjectId(userId)] }, // Check người dùng đang theo dõi
            },
        },

        // Option 2: Lấy bài viết nổi bật dựa vào likes hoặc createdAt
        {
            $addFields: {
                likesCount: { $size: { $ifNull: ['$likes', []] } },
            },
        },
        { $sort: { likesCount: -1, createdAt: -1 } }, // Sắp xếp theo lượt like và ngày tạo mới nhất

        // Pagination
        { $skip: skip },
        { $limit: take },

        // Populate thông tin người tạo bài viết
        {
            $project: {
                content: 1,
                media: 1,
                likesCount: 1,
                comments: 1,
                createdAt: 1,
                'author._id': 1,
                'author.name': 1, // Thêm các trường khác của User nếu cần
            },
        },
    ]);
    const totalPages = Math.ceil(totalItems / defaultLimit);
    const result = await this.postsRepository.getMixedNewsfeed(userId, take, skip);
    const metaResponseDto = plainToClass(MetaResponseDto, {
      current: +qs.currentPage || 1,
      pageSize: take,
      pages: totalPages,
    });
    const postListResponse = plainToClass(PostListResponseDto, {
      meta: metaResponseDto,
      data: result
    });
    return postListResponse;
  }
  
}
