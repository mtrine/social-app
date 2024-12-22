import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema({ timestamps: true })
export class Message {
  @Prop({ type: String, required: true }) // Chat ID liên kết với Chat Collection
  chatId: string;

  @Prop({ type: String, required: true }) // Người gửi
  senderId: string;

  @Prop({ type: String, required: true }) // Nội dung tin nhắn
  content: string;

  @Prop({ type: [String], default: [] }) // Tệp đính kèm (media)
  media: string[];

}

export const MessageSchema = SchemaFactory.createForClass(Message);