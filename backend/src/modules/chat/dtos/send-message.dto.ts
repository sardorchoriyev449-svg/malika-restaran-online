import { IsNotEmpty, IsOptional, IsString, MaxLength, ValidateIf } from "class-validator";

export class SendMessageDto {
    // text yoki image_url'dan kamida bittasi bo'lishi shart (rasm-yolg'iz xabar
    // ham, masalan to'lov skrinshoti, yuborilishi mumkin)
    @ValidateIf((o) => !o.image_url)
    @IsString()
    @IsNotEmpty()
    @MaxLength(2000)
    text?: string;

    @IsOptional()
    @IsString()
    image_url?: string;
}
