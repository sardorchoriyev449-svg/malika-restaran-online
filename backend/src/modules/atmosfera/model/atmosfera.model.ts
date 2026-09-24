import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { SchemaTypes } from "mongoose";

@Schema({ 
  collection: 'atmosfera', 
  timestamps: true, 
  versionKey: false 
})
export class Atmosfera{
    @Prop({type:SchemaTypes.String, required:true, unique:true})
    atmosfera:string

    // Shu joyda stol bron qilish uchun zalog summasi (so'mda). Faqat
    // "Online" bo'lmagan (ya'ni stol band qilinadigan) atmosferalar uchun
    // ma'noga ega; standart qiymat 0.
    @Prop({type:SchemaTypes.Number, required:false, default:0})
    zalog_summasi:number

    // Xizmat haqi — taomlar summasidan necha foiz olinishi (masalan 10 = 10%).
    // Restoran o'zi belgilaydi, standart qiymat 0 (xizmat haqi olinmaydi).
    @Prop({type:SchemaTypes.Number, required:false, default:0, min:0, max:100})
    xizmat_haqi_foizi:number
}

export const AtmosferaSchema = SchemaFactory.createForClass(Atmosfera)
