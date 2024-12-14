import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Res, Req } from '@nestjs/common';
import { AuthService } from './auth.service';

import { LocalAuthGuard } from './guard/local-auth.guard';
import { User } from 'src/decorators/user-infor.decorator';
import { IUser } from '../users/dto/user.interface';
import { Request, Response } from 'express';
import { ResponseMessage } from 'src/decorators/response-message.decorator';
import { Public } from 'src/decorators/public.decorator';
import { CreateUserDto } from '../users/dto/create-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @ResponseMessage("Login success")
  @Public()
  @Post('login')
  async login(
  @User() user: IUser,
  @Res({ passthrough: true }) response: Response) {
    return await this.authService.handleLogin(user, response);
  }

  @Get('/refresh-token')
  @Public()
  @ResponseMessage("Refresh token success")
  async refreshToken(@Req() req: Request, @Res({ passthrough: true }) response: Response){
    const refresh_token = req.cookies.refresh_token;
    return await this.authService.handleRefreshToken(refresh_token, response);
  }

  @Post('logout')
  @Public()
  @ResponseMessage("Logout success")
  async logout(@User() user: IUser, @Res({ passthrough: true }) response: Response){
    return await this.authService.handleLogout(user, response);
  }


  @Post('register')
  @Public()
  @ResponseMessage("Register success")
  async register(@Body() createUserDto: CreateUserDto) {
    return await this.authService.register(createUserDto);
  }

}
