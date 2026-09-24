import { Type } from "class-transformer";
import { ArrayMinSize, IsArray, IsEnum, IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsString, Min, ValidateNested } from "class-validator";
import { OrderStatus } from "../model/order.model";

export class OrderItemDto {
    @IsMongoId()
    product_id: string;

    @IsString()
    @IsNotEmpty()
    title: string;

    @IsNumber()
    price: number;

    @IsNumber()
    @Min(1)
    qty: number;
}

export class OrderAddressDto {
    @IsString()
    @IsNotEmpty()
    label: string;

    @IsString()
    @IsNotEmpty()
    address_text: string;

    @IsNumber()
    @IsNotEmpty()
    lat: number;

    @IsNumber()
    @IsNotEmpty()
    lng: number;
}

export class CreateOrderDto {
    @IsArray()
    @ArrayMinSize(1)
    @ValidateNested({ each: true })
    @Type(() => OrderItemDto)
    items: OrderItemDto[];

    // Yetkazib berish buyurtmasi bo'lsa ("Online" atmosfera tanlanganda) to'ldiriladi
    @IsOptional()
    @ValidateNested()
    @Type(() => OrderAddressDto)
    address?: OrderAddressDto;

    // Restoranda stolda o'tirib berilgan buyurtma bo'lsa (tashqari/ichkari/xona) to'ldiriladi
    @IsOptional()
    @IsMongoId()
    tabel_id?: string;

    // tabel_id berilganda quyidagi 5tasi ham MAJBURIY (service ichida tekshiriladi)
    @IsOptional()
    @IsNumber()
    @Min(1)
    bron_kun?: number;

    @IsOptional()
    @IsString()
    bron_oy?: string;

    @IsOptional()
    @IsNumber()
    bron_yil?: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    bron_soat?: number;

    @IsOptional()
    @IsNumber()
    @Min(1)
    bron_davomiylik_soat?: number;
}
export class UpdateOrderStatusDto {
    @IsEnum(OrderStatus, { message: "Status noto'g'ri qiymatda" })
    status: OrderStatus;
}

// Ofitsiant (Afitsant) paneli — mavjud stol buyurtmasiga qo'shimcha taom qo'shish uchun
export class AddOrderItemsDto {
    @IsArray()
    @ArrayMinSize(1)
    @ValidateNested({ each: true })
    @Type(() => OrderItemDto)
    items: OrderItemDto[];
}
