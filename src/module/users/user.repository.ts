import { BadRequestException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { User } from "./schema/user.schema";
import { Model } from "mongoose";
import { UpdateUserDto } from "./dto/update-user.dto";
import { CreateUserDto } from "./dto/create-user.dto";
import * as bcrypt from 'bcrypt';
@Injectable()
export class UserRepository {
    constructor(@InjectModel(User.name) private userModel: Model<User>) { }

    async create(user: CreateUserDto) {
        try {
            user.password = await bcrypt.hash(user.password, 10);
            let newUser = await this.userModel.create(user)
            return newUser;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    async findOneByEmail(email: string) {
        try {
            return await this.userModel.findOne({ email }, { isDelete: false });
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    async findOneByUsername(username: string) {
        try {
            const user = await this.userModel.findOne({ username, isDelete: false })
            return user;
        } catch (error) {
            throw new BadRequestException('Find user by username error');
        }
                
    }

    async findAll() {
        return await this.userModel.find({ isDelete: false });
    }

    async findById(id: string) {
        return await this.userModel.findById(id, { isDelete: false });
    }

    async updateById(id: string, user: UpdateUserDto) {
        return await this.userModel.findByIdAndUpdate(id, user)
    }

    async deleteById(id: string) {
        return await this.userModel.findByIdAndUpdate(id, { isDelete: true, DeleteAt: new Date() })
    }

    async searchByUsername(username: string) {
        return await this.userModel.find({ username: { $regex: username, $options: 'i' }, isDelete: false });
    }
}