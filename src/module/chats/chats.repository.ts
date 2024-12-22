import { Inject, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Chat } from "./schema/chat.schema";
import { Model } from "mongoose";
import { CreateChatDto } from "./dto/create-chat.dto";

@Injectable()
export class ChatRepository{
    constructor(
        @InjectModel(Chat.name) private chatModel: Model<Chat>,
    ) {}

    async createChat(createChatDto: CreateChatDto) {
        const newChat = this.chatModel.create(createChatDto);
        return newChat;
    }

    async updateLatestMessage(chatId: string,senderId: string, content: string) { 
        const updatedChat = this.chatModel.findByIdAndUpdate(chatId,{
            lastMessage: {
                content,
                senderId,
                createdAt: new Date(),
            }
        } , {new: true});
        return updatedChat;
    }

    async findOneChat(condition: any) {
        const chat = this.chatModel.findOne(condition);
        return chat;
    }

    find(condition: any) {
        return this.chatModel.find(condition);
    }
}