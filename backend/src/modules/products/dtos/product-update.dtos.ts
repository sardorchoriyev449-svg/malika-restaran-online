import { IsMongoId, IsNumber, IsOptional, IsString, MinLength } from "class-validator";

export class ProductUpdateDtos{
    @IsString()
    @MinLength(3)
    @IsOptional()
    title?:string

    @IsNumber()
    @IsOptional()
    price?:number

    @IsMongoId()
    @IsOptional()
    category_id?:string

    @IsString()
    @IsOptional()
    discriptions?:string

    @IsString()
    @IsOptional()
    image_url?:string
}
