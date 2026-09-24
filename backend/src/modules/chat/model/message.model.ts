import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { SchemaTypes, Types } from "mongoose";

export enum SenderRole {
    client = 'CLIENT',
    admin = 'ADMIN',
}

@Schema({ collection: 'messages', timestamps: true, versionKey: false })
export class Message {
    // Suhbat kimga tegishli ekanini bildiradi — har doim MIJOZning id'si
    // (admin xabar yozganda ham shu maydonga qaysi mijozga yozayotgani yoziladi)
    @Prop({ type: SchemaTypes.ObjectId, ref: 'Users', required: true })
    user_id: Types.ObjectId;

    // Xabarni aynan kim yuborgani (mijozning o'zi yoki qaysidir admin)
    @Prop({ type: SchemaTypes.ObjectId, ref: 'Users', required: true })
    sender_id: Types.ObjectId;

    @Prop({ type: SchemaTypes.String, enum: SenderRole, required: true })
    sender_role: SenderRole;

    @Prop({ type: SchemaTypes.String, required: false, trim: true })
    text?: string;

    // Fayl/rasm biriktirilgan bo'lsa (masalan to'lov skrinshoti) — /uploads/... yo'li
    @Prop({ type: SchemaTypes.String, required: false })
    image_url?: string;

    @Prop({ type: SchemaTypes.Boolean, default: false })
    read_by_admin: boolean;

    @Prop({ type: SchemaTypes.Boolean, default: false })
    read_by_user: boolean;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
