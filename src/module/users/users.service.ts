import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRepository } from './user.repository';

@Injectable()
export class UsersService {
  constructor(
    private userRepository: UserRepository,
  ) {}
  async create(createUserDto: CreateUserDto) {
    return await this.userRepository.create(createUserDto); ;
  }

  
 
  async update(id: string, updateUserDto: UpdateUserDto) {
    return await this.userRepository.updateById(id, updateUserDto);
  }

  async remove(id: string) {
    return await this.userRepository.deleteById(id);
  }

  async findOneByUsername(username: string){
    const user = await this.userRepository.findOneByUsername(username);
    if(!user) {
       throw new BadRequestException('User not found');
    };
    return user;
  }

  async findOneByEmail(email: string){
    const user = await this.userRepository.findOneByEmail(email);
    if(!user) {
       throw new BadRequestException('User not found');
    };
    return user;
  }
}
