import { WebSocketGateway, SubscribeMessage, MessageBody, OnGatewayConnection, OnGatewayDisconnect, WebSocketServer } from '@nestjs/websockets';
import { ChatsService } from './chats.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { MessagesService } from '../messages/messages.service';
import { Socket,Server } from 'socket.io';
import { CreateMessageDto } from '../messages/dto/create-message.dto';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@WebSocketGateway({ cors: true })
export class ChatsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private activeUsers: Map<string, string> = new Map(); // userId -> socketId mapping

  constructor(
    private readonly messageService: MessagesService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.headers.authorization?.split(' ')[1];
      if (!token) {
        throw new UnauthorizedException('Token not found');
      }

      const decoded = this.jwtService.verify(token, {
        secret: this.configService.get<string>('JWT_ACCESS_TOKEN_SECRET'),
      });
      client.data.user = decoded; // Attach decoded user data to client
      console.log(`Client connected: ${client.id}, User: ${decoded.userId}`);
    } catch (error) {
      console.log('Unauthorized connection attempt');
      client.disconnect(); // Disconnect unauthorized client
    }
  }

  async handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    this.activeUsers.delete(client.id);
  }

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(client: Socket, payload: { userId: string }) {
    this.activeUsers.set(client.id, payload.userId);
    console.log(`User ${payload.userId} joined with socket ${client.id}`);
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    client: Socket,
    createMessageDto: CreateMessageDto,
  ) {
  
    // Lưu tin nhắn vào MongoDB
    const message = await this.messageService.sendMessage(createMessageDto);

    // Phát tin nhắn tới những người tham gia phòng
    this.server.to(createMessageDto.chatId).emit('receiveMessage', message);
  }

  @SubscribeMessage('joinChat')
  async handleJoinChat(client: Socket, payload: { chatId: string }) {
    client.join(payload.chatId);
    console.log(`Client ${client.id} joined room ${payload.chatId}`);
  }
}
