import { IsMongoId, IsNotEmpty, IsNumber, Min } from "class-validator";

export class CreateTabelDto {
    @IsMongoId()
    @IsNotEmpty()
    atmosfera_id: string;

    @IsNumber()
    @Min(1)
    @IsNotEmpty()
    stol_raqami: number;
}
