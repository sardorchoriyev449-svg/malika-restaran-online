import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { SchemaTypes, Types } from "mongoose";

@Schema({ 
  collection: 'orders', 
  timestamps: true, 
  versionKey: false 
})
export class OrderItem {
    @Prop({ type: SchemaTypes.ObjectId, ref: 'Product', required: true })
    product_id: Types.ObjectId;

    @Prop({ type: SchemaTypes.String, required: true })
    title: string;

    @Prop({ type: SchemaTypes.Number, required: true })
    price: number;

    @Prop({ type: SchemaTypes.Number, required: true })
    qty: number;
}
export const OrderItemSchema = SchemaFactory.createForClass(OrderItem);

// Buyurtma vaqtidagi manzil "suratini" (snapshot) saqlaymiz — chunki foydalanuvchi
// keyinchalik manzilni o'chirsa/o'zgartirsa ham, eski buyurtmaning manzili o'zgarmasligi kerak.
@Schema({ _id: false })
export class OrderAddress {
    @Prop({ type: SchemaTypes.String, required: true })
    label: string;

    @Prop({ type: SchemaTypes.String, required: true })
    address_text: string;

    // GPS koordinatalari MAJBURIY — soxta/qo'lda kiritilgan manzil bilan
    // aldashning oldini olish uchun buyurtma faqat haqiqiy joylashuv bilan qabul qilinadi.
    @Prop({ type: SchemaTypes.Number, required: true })
    lat: number;

    @Prop({ type: SchemaTypes.Number, required: true })
    lng: number;
}
export const OrderAddressSchema = SchemaFactory.createForClass(OrderAddress);

export enum OrderStatus {
    pending = 'PENDING',
    preparing = 'PREPARING',
    delivering = 'DELIVERING',
    delivered = 'DELIVERED',
    cancelled = 'CANCELLED',
}

// Stol bron qilishni xazillashib/soxta band qilishning oldini olish uchun:
// mijoz stol bilan buyurtma bergan zahoti bu bron avtomatik tasdiqlanmaydi —
// admin ko'rib chiqib, tasdiqlaydi yoki rad etadi. Onlayn (yetkazib berish)
// buyurtmalar uchun bu maydon ishlatilmaydi (undefined qoladi).
export enum ReservationApproval {
    pendingReview = 'PENDING_REVIEW',
    confirmed = 'CONFIRMED',
    rejected = 'REJECTED',
}

@Schema({ collection: 'order', timestamps: true, versionKey: false })
export class Order {
    @Prop({ type: SchemaTypes.ObjectId, ref: 'Users', required: true })
    user_id: Types.ObjectId;

    @Prop({ type: [OrderItemSchema], required: true })
    items: OrderItem[];

    @Prop({ type: SchemaTypes.Number, required: true })
    total: number;

    // Yetkazib berish buyurtmasi bo'lsa to'ldiriladi ("Online" atmosfera)
    @Prop({ type: OrderAddressSchema, required: false })
    address?: OrderAddress;

    // Restoranda stolda o'tirib berilgan buyurtma bo'lsa to'ldiriladi
    // (tashqari/ichkari/xona atmosferalari uchun)
    @Prop({ type: SchemaTypes.ObjectId, ref: 'Tabel', required: false })
    tabel_id?: Types.ObjectId;

    // Stol qaysi sana va soatda, necha soatga band qilinganini bildiradi.
    // Shu orqali bitta stol turli vaqt oralig'ida bir nechta mijozga
    // bron qilinishi mumkin (masalan 16:00-17:00 va 18:00-19:00).
    @Prop({ type: SchemaTypes.Number, required: false })
    bron_kun?: number;

    @Prop({ type: SchemaTypes.String, required: false })
    bron_oy?: string;

    @Prop({ type: SchemaTypes.Number, required: false })
    bron_yil?: number;

    // 0-23 oralig'ida, stol band bo'lgan boshlanish soati
    @Prop({ type: SchemaTypes.Number, required: false })
    bron_soat?: number;

    // Mijoz necha soat o'tirishni rejalashtirgani (qo'lda kiritiladi)
    @Prop({ type: SchemaTypes.Number, required: false })
    bron_davomiylik_soat?: number;

    // Admin bron so'rovini tasdiqlaganda, mijoz haqiqatda to'lagan zalog
    // summasini shu yerga kiritadi (masalan chek/skrinshotga qarab).
    @Prop({ type: SchemaTypes.Number, required: false })
    zalog_tolandi?: number;

    @Prop({ type: SchemaTypes.String, enum: OrderStatus, default: OrderStatus.pending })
    status: OrderStatus;

    // Faqat stol (tabel_id) buyurtmalari uchun ishlatiladi — admin tomonidan
    // tasdiqlangan/rad etilganini bildiradi.
    @Prop({ type: SchemaTypes.String, enum: ReservationApproval, required: false })
    approval_status?: ReservationApproval;

    // Taxminan necha daqiqada tayor bo'lishi (frontend shu asosda "taxminan tayor
    // bo'lish vaqti"ni hisoblaydi: createdAt + estimated_minutes)
    @Prop({ type: SchemaTypes.Number, default: 40 })
    estimated_minutes: number;
}
export const OrderSchema = SchemaFactory.createForClass(Order);