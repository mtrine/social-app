import { BadRequestException, Inject, Injectable, Res } from '@nestjs/common';
import { Response as ExpressResponse, Response } from 'express';

import { UserRepository } from '../users/user.repository';
import * as bcrypt from 'bcrypt';
import { IUser } from '../users/dto/user.interface';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import * as ms from 'ms';
import { User } from 'src/decorators/user-infor.decorator';
import { CreateUserDto } from '../users/dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private userRepository: UserRepository,
    private jwtService: JwtService,
    private configService: ConfigService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {}
  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.userRepository.findOneByEmail(email);
    if(!user) {
      return null;
    }
    const isPass= await bcrypt.compare(pass,user.password)
    if (user && isPass) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async register(createUserDto: CreateUserDto) {
    const { email, username } = createUserDto;
    // const user = await this.userRepository.findOneByEmail(email);
    // if (user) {
    //   throw new BadRequestException('Email already exists');
    // }
    // const user2 = await this.userRepository.findOneByUsername(username);
    // if (user2) {
    //   throw new BadRequestException('Username already exists');
    // }
    const newUser = await this.userRepository.create(createUserDto);
    return newUser
  }

  async handleLogin(user: IUser, response: Response) {
    const {_id, name,username, email, bio, avatar, gender} = user;

    const payload = { 
      sub: "token login",
      iss: "from server",
      _id,
      username,
      name,
      email,
      bio,
      avatar,
      gender
    }
    const new_refresh_token = this.generateRefreshToken(payload)
    await this.cacheManager.set(`refresh_token:${_id}`, new_refresh_token)
    response.clearCookie("refresh_token")
    response.cookie('refresh_token', new_refresh_token, {
        httpOnly: true,
        secure: true,
        maxAge: +ms(this.configService.get<string>('JWT_REFRESH_EXPIRE')),
        sameSite: 'none'
      })
      return {
        access_token: this.jwtService.sign(payload),
        user: {
          _id,
          username,
          name,
          email,
          bio,
          avatar,
          gender,
        }
  }
}

  generateRefreshToken(payload: any) {
    const refresh_token = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRE')
    })
    return refresh_token
  }

  async handleRefreshToken(refreshToken: string, response: Response) {
    try {
      const decoded = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
      });

      // Get user ID from token
      const userId = decoded._id;

      // Retrieve refresh token from Redis
      const cachedToken = await this.cacheManager.get<string>(
        `refresh_token:${userId}`,
      );

      if (!cachedToken || cachedToken !== refreshToken) {
        throw new BadRequestException('Invalid refresh token');
      }

      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new BadRequestException('User not found');
      }

      const { _id, name,username, email, bio, avatar, gender } = user;

      const newPayload = {
        sub: 'token login',
        iss: 'from server',
        _id,
        username,
        name,
        email,
        bio,
        avatar,
        gender,
      };

      const newRefreshToken = this.generateRefreshToken(newPayload);

      // Update refresh token in Redis
      await this.cacheManager.set(`refresh_token:${_id}`, newRefreshToken);

      response.clearCookie('refresh_token');
      response.cookie('refresh_token', newRefreshToken, {
        httpOnly: true,
        secure: true,
        maxAge: +this.configService.get<string>('JWT_REFRESH_EXPIRE'),
        sameSite: 'none',
      });

      return {
        access_token: this.jwtService.sign(newPayload),
        user: {
          _id,
          username,
          name,
          email,
          bio,
          avatar,
          gender,
        }
      };
    } catch (error) {
      console.error('HandleRefreshToken Error:', error);
      throw new BadRequestException('Invalid refresh token');
    }
  }

  async handleLogout( user: IUser,  response: Response) {
    await this.cacheManager.del(`refresh_token:${user._id}`)
    response.clearCookie("refresh_token")
    return "ok"
  }
}
