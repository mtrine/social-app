import { IsArray, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreatePostDto {
    @IsString()
    @IsNotEmpty()
    authorId: string; // Tham chiếu đến User
  
    @IsString()
    @IsNotEmpty()
    content: string; // Nội dung bài viết
  
    @IsArray()
    @IsOptional()
    media: string[]; // Danh sách URL của ảnh/video đính kèm

}
