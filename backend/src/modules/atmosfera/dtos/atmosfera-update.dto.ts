import { PartialType } from "@nestjs/mapped-types";
import { CreateAtmosferaDto } from "./atmosfera-create.dto";

export class UpdateAtmosferaDto extends PartialType(CreateAtmosferaDto) {}
