import { PartialType } from "@nestjs/mapped-types";
import { CreateTabelDto } from "./tabel-create.dto";

export class UpdateTabelDto extends PartialType(CreateTabelDto) {}
