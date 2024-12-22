import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { Serialize } from 'src/decorators/serialize.decorator';
import { MessageListResponse } from './dto/message-response.dto';
import { ResponseMessage } from 'src/decorators/response-message.decorator';

@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get("getByChatId/:chatId")
  @Serialize(MessageListResponse)
  @ResponseMessage("Get messages by chatId successfully")
  async getMessagesByChat(@Param('chatId') chatId: string) {
    return this.messagesService.getMessagesByChat(chatId);
  }
}
