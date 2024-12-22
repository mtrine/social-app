import { Expose, Type } from "class-transformer";
import { MetaResponseDto } from "src/core/meta-response";

export class MessageResponseDto {
    @Expose()
    chatId: string;

    @Expose()
    senderId: string;

    @Expose()
    content: string;

    @Expose()
    media: string[];

    @Expose()
    createdAt: Date;

    @Expose()
    updatedAt: Date;

}

export class MessageListResponse {
    @Expose()
    @Type(() => MetaResponseDto)
    meta:MetaResponseDto;

    @Expose()
    @Type(() => MessageResponseDto)
    data: MessageResponseDto[];
}