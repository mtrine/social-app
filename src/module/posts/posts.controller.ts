import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { ResponseMessage } from 'src/decorators/response-message.decorator';
import { Serialize } from 'src/decorators/serialize.decorator';
import { PostListResponseDto, PostResponseDto } from './dto/post-response.dto';
import { User } from 'src/decorators/user-infor.decorator';
import { IUser } from '../users/dto/user.interface';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @ResponseMessage('Post created successfully')
  @Serialize(PostResponseDto)
  create(@Body() createPostDto: CreatePostDto) {
    return this.postsService.create(createPostDto);
  }

  @Get('myPosts')
  @Serialize(PostListResponseDto)
  async getMyPosts(@User() user:IUser,@Query() qs:any) {
    return await this.postsService.getMyPosts(user._id,qs);
  }

  @Get('myNewsfeed')
  @Serialize(PostListResponseDto)
  async getMyNewsfeed(@User() user:IUser,@Query() qs:any) {
    return await this.postsService.getMyNewsfeed(user._id,qs);
  }
}
