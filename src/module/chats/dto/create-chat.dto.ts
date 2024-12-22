import { IsArray, IsNotEmpty } from "class-validator";

export class CreateChatDto {
    @IsArray()
    @IsNotEmpty()
    participants: string[];
}
