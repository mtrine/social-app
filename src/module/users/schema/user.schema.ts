import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";

@Schema({timestamps: true})
export class User {

    @Prop({required: true, unique: true})
    email: string;

    @Prop({required: true})
    password: string;

    @Prop({required: true})
    name: string;

    @Prop({required: true, unique: true})
    username: string;

    @Prop({default: ''})
    avatar: string;

    @Prop({default: ''})
    bio: string;

    @Prop({required: true})
    gender:boolean

    @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }] })
    followers: Types.ObjectId[];

    @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }] })
    following: Types.ObjectId[];

    @Prop({default: false})
    isDelete: boolean;

    @Prop({default: null})
    DeleteAt: Date;

}
export const UserSchema = SchemaFactory.createForClass(User);