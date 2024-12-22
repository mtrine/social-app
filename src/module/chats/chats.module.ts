import { forwardRef, Module } from '@nestjs/common';
import { ChatsService } from './chats.service';
import { ChatsGateway } from './chats.gateway';
import { MongooseModule } from '@nestjs/mongoose';
import { Chat, ChatSchema } from './schema/chat.schema';
import { MessagesModule } from '../messages/messages.module';
import { ChatRepository } from './chats.repository';
import { ChatController } from './chats.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Chat.name, schema: ChatSchema }]),
    forwardRef(() => MessagesModule),
  ],
  controllers: [ChatController],
  providers: [ ChatsService, ChatRepository,ChatsGateway,],
  exports: [ChatsService, ChatRepository],
})
export class ChatsModule { }
