import { IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class LoginDto{
    
    @IsNotEmpty()
    @IsString()
    @MinLength(9)
    @MaxLength(9)
    phone:string;
    
    @IsNotEmpty()
    @IsString()
    @MinLength(8)
    password:string;

    @IsOptional()
    @IsString()
    telegramId:string

}