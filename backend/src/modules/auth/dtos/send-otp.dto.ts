import { IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";

export class SendOtpDto {
    @IsNotEmpty()
    @IsString()
    @MinLength(9)
    @MaxLength(9)
    phone: string;
}
