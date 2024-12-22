import { forwardRef, Module } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Message, MessageSchema } from './schema/message.schema';
import { MessagesRepository } from './messages.repository';
import { ChatsModule } from '../chats/chats.module';

@Module({
  imports: [
    MongooseModule.forFeature([{name:Message.name,schema:MessageSchema}]),
    forwardRef(() => ChatsModule)
  ],
  controllers: [MessagesController],
  providers: [MessagesService,MessagesRepository],
  exports: [MessagesRepository,MessagesService]
})
export class MessagesModule {}
