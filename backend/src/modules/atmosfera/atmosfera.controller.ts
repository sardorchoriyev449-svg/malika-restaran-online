import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from "@nestjs/common";
import { AtmosferaService } from "./atmosfera.service";
import { CreateAtmosferaDto } from "./dtos/atmosfera-create.dto";
import { UpdateAtmosferaDto } from "./dtos/atmosfera-update.dto";
import { AuthGuard } from "../../common/guards/auth.guard";
import { Protected } from "../../common/guards/protected.guard";
import { RolesGuard, type RequestWithUser } from "../../common/guards/role.guard";

@Controller('atmosfera')
@UseGuards(AuthGuard)
export class AtmosferaController {
    constructor(private readonly service: AtmosferaService) {}

    // Menyu kabi bu ro'yxatni ham har kim (login qilmagan mijoz ham) ko'ra olishi kerak
    @Get()
    async getAll() {
        return await this.service.getAll();
    }

    @Get(':id')
    async getOne(@Param('id') id: string) {
        return await this.service.getOne(id);
    }

    @Post()
    @Protected()
    async create(@Body() dto: CreateAtmosferaDto, @Req() req: RequestWithUser) {
        return await this.service.create(dto, req);
    }

    @Patch(':id')
    @Protected()
    async update(@Param('id') id: string, @Body() dto: UpdateAtmosferaDto, @Req() req: RequestWithUser) {
        return await this.service.update(id, dto, req);
    }

    @Delete(':id')
    @Protected()
    async delete(@Param('id') id: string, @Req() req: RequestWithUser) {
        return await this.service.delete(id, req);
    }
}
