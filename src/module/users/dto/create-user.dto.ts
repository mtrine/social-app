import { IsEmail, IsEmpty, IsNotEmpty, MinLength } from "class-validator";

export class CreateUserDto {
    @IsEmail({}, { message: 'Invalid email' })
    email: string;

    @MinLength(6, { message: 'Password is too short' })
    password: string;

    @MinLength(3, { message: 'Name is too short' })
    name: string;

    @MinLength(3, { message: 'Username is too short' })
    username: string;

    @IsNotEmpty({ message: 'Gender is not allowed' })
    gender: boolean;
}
