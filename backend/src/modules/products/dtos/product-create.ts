import { IsMongoId, IsNotEmpty, IsNumber, IsString, MinLength } from "class-validator"

export class CreateProductDtos{
    @IsString()
    @MinLength(3)
    @IsNotEmpty()
    title:string
    
    @IsNumber()
    @IsNotEmpty()
    price:number

    @IsMongoId()
    @IsNotEmpty()
    category_id:string
    
    @IsString()
    @IsNotEmpty()
    discriptions:string
    
    @IsString()
    @IsNotEmpty()
    image_url:string
}