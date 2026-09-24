import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { SchemaTypes, Document } from "mongoose";

@Schema({ 
  collection: 'category', 
  timestamps: true, 
  versionKey: false 
})
export class Category extends Document {
  @Prop({ type: SchemaTypes.String, required: true, trim: true, unique: true })
  name: string;
}

export const CategorySchema = SchemaFactory.createForClass(Category);