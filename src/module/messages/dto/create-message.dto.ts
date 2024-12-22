import { IsArray, IsNotEmpty, IsString } from "class-validator";

export class CreateMessageDto {

    @IsNotEmpty()
    @IsString()
    chatId: string;

    @IsString()
    @IsNotEmpty()
    senderId: string;
    @IsString()
    @IsNotEmpty()
    content: string;

    @IsArray()
    media: string[];

}
