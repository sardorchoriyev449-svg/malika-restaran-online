import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { SchemaTypes } from "mongoose";
import { UserRoles } from "../../../common/guards/user-role.guard";

@Schema({collection:'users', timestamps:true, versionKey:false})
export class Users{
    @Prop({type:SchemaTypes.String,required:true})
    fullName:string

    @Prop({type:SchemaTypes.Int32,required:true})
    age:number
    
    @Prop({type:SchemaTypes.String, required:true})
    phone:string

    @Prop({type:SchemaTypes.String})
    telegramId?:string

    @Prop({type:SchemaTypes.String,required:true})
    password:string

    @Prop({type:SchemaTypes.String, enum:UserRoles, default:UserRoles.client})
    role:string
}

export const UserSchema = SchemaFactory.createForClass(Users)