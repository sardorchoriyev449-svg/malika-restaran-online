import { IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength, Min, MinLength } from "class-validator";

export class RegisterDto{
    
    @IsNotEmpty()
    @IsString()
    @MinLength(4)
    fullName:string

    @IsNotEmpty()
    @IsNumber()
    @Min(17)
    age:number

    @IsOptional()
    @IsString()
    telegramId:string
    
    @IsNotEmpty()
    @IsString()
    @MinLength(9)
    @MaxLength(9)
    phone:string
    
    @IsNotEmpty()
    @IsString()
    @MinLength(8)
    password:string

    // Telefon raqamga SMS orqali yuborilgan 6 xonali tasdiqlash kodi
    @IsNotEmpty()
    @IsString()
    @MinLength(6)
    @MaxLength(6)
    otp_code:string

}