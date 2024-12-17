import { Expose, Type } from "class-transformer";
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
    @Type(() => UserResponseDto)
    followers: UserResponseDto[];

    @Expose()
    @Type(() => UserResponseDto)
    following: UserResponseDto[];

    @Expose()
    createdAt: Date;

    @Expose()
    updatedAt: Date;
}

export class UserListResponseDto {
    @Expose()
    meta: MetaResponseDto;

    @Expose()
    @Type(() => UserResponseDto)
    data: UserResponseDto[];
}
