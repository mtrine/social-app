import { Expose, Type } from "class-transformer";

export class LastMessageResponseDto {
    
        @Expose()
        content: string;
    
        @Expose()
        senderId: string;
    
        @Expose()
        createdAt: Date;

}

export class ChatResponseDto {

    @Expose()
    _id: string;

    @Expose()
    @Type(() => String)
    participants: string[];

    @Expose()
    @Type(() => LastMessageResponseDto)
    lastMessage: LastMessageResponseDto;

}