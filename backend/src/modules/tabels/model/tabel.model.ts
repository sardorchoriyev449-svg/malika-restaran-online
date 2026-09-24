import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { SchemaTypes, Types } from "mongoose"

// Stol endi DOIMIY (fizik) obyekt — sana bilan bog'liq emas.
// Masalan: "Tashqari" atmosferasida 6 ta stol bo'lsa, ular bir marta yaratiladi
// va doim shu holida qoladi. Kimning qachon qaysi stolni band qilgani esa
// Order (buyurtma) ichida sana+soat+davomiylik orqali alohida kuzatiladi.
@Schema({
  collection: 'tabels',
  timestamps: true,
  versionKey: false
})
export class Tabel{
    @Prop({type:SchemaTypes.ObjectId, ref: 'Atmosfera', required:true})
    atmosfera_id:Types.ObjectId

    @Prop({type:SchemaTypes.Number, required:true})
    stol_raqami:number
}

export const TabelSchema = SchemaFactory.createForClass(Tabel)
TabelSchema.index({ atmosfera_id: 1, stol_raqami: 1 }, { unique: true })
