import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Message } from "./schema/message.schema";
import { Model } from "mongoose";
import { CreateChatDto } from "../chats/dto/create-chat.dto";
import { CreateMessageDto } from "./dto/create-message.dto";

@Injectable()
export class MessagesRepository {
    constructor(
        @InjectModel(Message.name) private messageModel: Model<Message>,
    ) { }

    async create(createMessageDto: CreateMessageDto) {
        return await this.messageModel.create(createMessageDto);
    }

    async findAndSort(condition: any) {
        return this.messageModel.find(condition).sort({ createdAt: 1 }).exec();
    }
}