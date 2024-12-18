import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRepository } from './user.repository';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { plainToClass } from 'class-transformer';
import { MetaResponseDto } from 'src/core/meta-response';
import { UserListResponseDto } from './dto/user-response.dto';
import { ObjectId, Types } from 'mongoose';

@Injectable()
export class UsersService {
  constructor(
    private userRepository: UserRepository,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const user = await this.userRepository.create(createUserDto);
    // Xóa cache liên quan đến danh sách user
    await this.cacheManager.del('users_list');
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.userRepository.updateById(id, updateUserDto);
    // Cập nhật cache
    await this.cacheManager.set(`user_${id}`, user);
    return user;
  }

  async remove(id: string) {
   const user  = await this.userRepository.deleteById(id);
    // Xóa cache
    await this.cacheManager.del(`user_${id}`);
    return user;
  }

  async findOneByEmail(email: string) {
    // Kiểm tra cache trước
    const cachedUser = await this.cacheManager.get(`user_${email}`);
    if (cachedUser) {
      return cachedUser;
    }

    const user = await this.userRepository.findOneByEmail(email);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Lưu vào cache
    await this.cacheManager.set(`user_${email}`, user);
    return user;
  }
  async findOneByUsername(username: string) {
    // Kiểm tra cache trước
    const cachedUser = await this.cacheManager.get(`user_${username}`);
    if (cachedUser) {
      return cachedUser;
    }

    const user = await this.userRepository.findOneByUsername(username);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Lưu vào cache
    await this.cacheManager.set(`user_${username}`, user);
    return user;
  }

  async searchByUsername(username: string, qs: any) {
    
    const cacheKey = `search_users_${username}_${qs.currentPage}_${qs.limit}`;
    const cachedResult = await this.cacheManager.get(cacheKey);
    if (cachedResult) {
      return cachedResult;
    }
    const take = +qs.limit || undefined
    const skip = (+qs.currentPage - 1) * (+qs.limit) || 0
    const defaultLimit = +qs.limit ? +qs.limit : 10
   
    const totalItems = await this.userRepository.countDocuments({ username: { $regex: username, $options: 'i' }, isDelete: false });
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const metaResponseDto = plainToClass(MetaResponseDto, {
      current: +qs.currentPage || 1,
      pageSize: take,
      pages: totalPages,
      total:totalItems
    });
    const result = await this.userRepository.searchByUsername(username,take,skip);
    const userListResponse = plainToClass(UserListResponseDto, {
            meta: metaResponseDto,
            data: result
        });
        
    await this.cacheManager.set(cacheKey, result);
    return userListResponse;
  }

  async followUser(userId: string, followId:  string) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new BadRequestException('User not found');
    }
    const followUser = await this.userRepository.findById(followId);
    if (!followUser) {
      throw new BadRequestException('Follow user not found');
    }

    // Kiểm tra đã follow chưa
    if (user.following.includes(followId as unknown as Types.ObjectId)) {
      throw new BadRequestException('User followed');
    }

    user.following.push(followId as unknown as Types.ObjectId);
    followUser.followers.push(userId as unknown as Types.ObjectId);

    await user.save();
    await followUser.save();
    return followUser;
  }
}