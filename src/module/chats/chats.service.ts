import { Injectable } from '@nestjs/common';
import { CreateChatDto } from './dto/create-chat.dto';
import { MessagesRepository } from '../messages/messages.repository';
import { ChatRepository } from './chats.repository';

@Injectable()
export class ChatsService {
  constructor(
    private readonly chatRepository: ChatRepository,
  ) {}

  async findOrCreateChat(createChatDto: CreateChatDto) {
    // Sắp xếp participants để tránh trường hợp đảo ngược vị trí gây duplicate
    createChatDto.participants.sort();

    let chat = await this.chatRepository.findOneChat({ participants:createChatDto.participants });
    if (!chat) {
      chat = await this.chatRepository.createChat({ participants: createChatDto.participants });
    }
    return chat;
  }

  async getChatsByUser(userId: string) {
    return this.chatRepository.find({ participants: userId });
  }
}
