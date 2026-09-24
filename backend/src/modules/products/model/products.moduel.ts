import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { SchemaTypes, Types } from "mongoose";
import { Category } from "../../categories/model/category.model";

@Schema({collection:'product', timestamps:true, versionKey:false})
export class Product{
    @Prop({type:SchemaTypes.String, required:true})
    title:string

    @Prop({type:SchemaTypes.Number, required:true})
    price:number

    @Prop({ 
        type: SchemaTypes.ObjectId, 
        ref: 'Category', 
        required: true,
    })
    category_id: Types.ObjectId; 

    @Prop({type:SchemaTypes.String, required:true})
    discriptions:string

    @Prop({type:SchemaTypes.String, required:true})
    image_url:string
}

export const ProductSchema = SchemaFactory.createForClass(Product)