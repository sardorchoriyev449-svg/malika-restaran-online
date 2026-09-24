import { IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from "class-validator";

export class CreateAtmosferaDto {
    @IsString()
    @IsNotEmpty()
    atmosfera: string;

    @IsNumber()
    @Min(0)
    @IsOptional()
    zalog_summasi?: number;

    @IsNumber()
    @Min(0)
    @Max(100)
    @IsOptional()
    xizmat_haqi_foizi?: number;
}
