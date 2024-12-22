import { Injectable } from '@nestjs/common';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { MessagesRepository } from './messages.repository';
import { ChatRepository } from '../chats/chats.repository';

@Injectable()
export class MessagesService {
  constructor(
    private readonly messagesRepository: MessagesRepository,
    private readonly chatRepository: ChatRepository,
  ) {}

  async sendMessage(createMessageDto: CreateMessageDto) {
    const message = await this.messagesRepository.create(createMessageDto);

    // Cập nhật lastMessage trong Chat
    await this.chatRepository.updateLatestMessage(createMessageDto.chatId, createMessageDto.senderId,createMessageDto.content);

    return message;
  }

  // Lấy tin nhắn theo chatId
  async getMessagesByChat(chatId: string) {
    return this.messagesRepository.findAndSort({ chatId });
  }
}
