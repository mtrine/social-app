import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type PostDocument = HydratedDocument<Post>;

@Schema({ timestamps: true })
export class Post {
  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  authorId: string; // Tham chiếu đến User

  @Prop({ required: true, type: String })
  content: string; // Nội dung bài viết

  @Prop({ type: [String], default: [] })
  media: string[]; // Danh sách URL của ảnh/video đính kèm

  @Prop({ type: [Types.ObjectId], ref: 'User', default: [] })
  likes: string[]; // Danh sách người dùng đã like

  @Prop({
    type: [
      {
        userId: { type: Types.ObjectId, ref: 'User', required: true },
        content: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    default: [],
  })
  comments: {
    userId: string;
    content: string;
    createdAt: Date;
  }[]; // Danh sách bình luận

  @Prop({ type: Boolean, default: false })
  isDeleted: boolean; // Soft delete
}

export const PostSchema = SchemaFactory.createForClass(Post);
