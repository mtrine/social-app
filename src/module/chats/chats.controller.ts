import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ChatsService } from './chats.service';
import { Serialize } from 'src/decorators/serialize.decorator';
import { ChatResponseDto } from './dto/chat-response.dto';
import { ResponseMessage } from 'src/decorators/response-message.decorator';
import { CreateChatDto } from './dto/create-chat.dto';


@Controller('chats')
export class ChatController {
  constructor(private readonly chatService:ChatsService) {}
  

  @Post()
  @Serialize(ChatResponseDto)
  @ResponseMessage('Chat created successfully')
  create(@Body() createChatDto: CreateChatDto) {
    return this.chatService.findOrCreateChat(createChatDto);
  }

}
