import { Expose, Type } from 'class-transformer';
import { MetaResponseDto } from 'src/core/meta-response';

export class CommentResponseDto {
  @Expose()
  userId: string;

  @Expose()
  content: string;

  @Expose()
  createdAt: Date;
}

export class PostResponseDto {
  @Expose()
  _id: string;

  @Expose()
  authorId: string;

  @Expose()
  content: string;

  @Expose()
  media: string[];

  @Expose()
  @Type(() => String)
  likes: string[];

  @Expose()
  @Type(() => CommentResponseDto)
  comments: CommentResponseDto[];

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Expose()
  isDeleted: boolean;
}

export class PostListResponseDto {
  @Expose()
  meta: MetaResponseDto;

  @Expose()
  @Type(() => PostResponseDto)
  data: PostResponseDto[];
}