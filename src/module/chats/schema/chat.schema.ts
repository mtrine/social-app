import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema({ timestamps: true })
export class Chat {
    @Prop({ type: [String], required: true }) // Hai người tham gia chat
    participants: string[];
  
    @Prop({
      type: {
        content: { type: String, required: false }, // Nội dung tin nhắn cuối cùng
        senderId: { type: String, required: false }, // ID người gửi tin nhắn cuối
        createdAt: { type: Date, required: false }, // Thời điểm gửi tin nhắn cuối
      },
      default: null, // Mặc định không có tin nhắn cuối
    })
    lastMessage: {
      content: string;
      senderId: string;
      createdAt: Date;
    };
}

export const ChatSchema = SchemaFactory.createForClass(Chat);
