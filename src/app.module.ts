import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './module/users/users.module';
import { AuthModule } from './module/auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { PostsModule } from './module/posts/posts.module';
import { ChatsModule } from './module/chats/chats.module';
import { MessagesModule } from './module/messages/messages.module';
import { NotificationModule } from './module/notification/notification.module';


import * as redisStore from 'cache-manager-redis-store';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI'),        
        }),
      inject: [ConfigService],
    }),
    CacheModule.register({
      isGlobal: true,
      store: redisStore,
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
    }),
    UsersModule, 
    AuthModule, PostsModule, ChatsModule, MessagesModule, NotificationModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
