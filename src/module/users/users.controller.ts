import { Controller, Get, Post, Body, Patch, Param, Delete, Res, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Serialize } from 'src/decorators/serialize.decorator';
import { UserListResponseDto, UserResponseDto } from './dto/user-response.dto';
import { ResponseMessage } from 'src/decorators/response-message.decorator';
import { Public } from 'src/decorators/public.decorator';
import { User } from 'src/decorators/user-infor.decorator';
import { IUser } from './dto/user.interface';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Serialize(UserResponseDto)
  @ResponseMessage('User created successfully')
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Patch(':id')
  @ResponseMessage('User updated successfully')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @ResponseMessage('User deleted successfully')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  @Get('findByUsername/:username')
  @Serialize(UserResponseDto)
  getOneByUsername(@Param('username') username: string){
    return this.usersService.findOneByUsername(username);
  }

  @Get('searchByUsername/:username')
  @Serialize(UserListResponseDto)
  @ResponseMessage('User list fetched successfully')
  searchByUsername(@Param('username') username: string,@Query() qs:any) {
    return this.usersService.searchByUsername(username,qs);
  }

  @Post('follow/:id')
  @ResponseMessage('Followed successfully')
  @Serialize(UserResponseDto)
  async follow(@User() user:IUser,@Param('id') id: string) {
    return await this.usersService.followUser(user._id, id);
  }
}
