import { Expose } from "class-transformer";
import { MetaResponseDto } from "src/core/meta-response";

export class UserResponseDto {
    @Expose()
    _id: string;
    
    @Expose()
    username: string;

    @Expose()
    email: string;

    @Expose()
    bio: string;

    @Expose()
    avatar: string;

    @Expose()
    gender: boolean;

    @Expose()
    followers: UserResponseDto[];

    @Expose()
    following: UserResponseDto[];
}

export class UserListResponseDto {
    @Expose()
    meta:MetaResponseDto;

    @Expose()
    data: UserResponseDto[];
}