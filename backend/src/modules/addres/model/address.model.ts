import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { SchemaTypes, Types } from "mongoose";

@Schema({ collection: 'address', timestamps: true, versionKey: false })
export class Address {
    @Prop({ type: SchemaTypes.ObjectId, ref: 'Users', required: true })
    user_id: Types.ObjectId;

    @Prop({ type: SchemaTypes.String, required: true })
    label: string;

    @Prop({ type: SchemaTypes.String, required: true })
    address_text: string;

    @Prop({ type: SchemaTypes.Number, required: false })
    lat: number;

    @Prop({ type: SchemaTypes.Number, required: false })
    lng: number;
}
export const AddressSchema = SchemaFactory.createForClass(Address);