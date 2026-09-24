import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from "@nestjs/common";
import { TabelServic } from "./tabel.service";
import { CreateTabelDto } from "./dtos/tabel-create.dto";
import { UpdateTabelDto } from "./dtos/tabel-update.dto";
import { AuthGuard } from "../../common/guards/auth.guard";
import { Protected } from "../../common/guards/protected.guard";
import { RolesGuard, type RequestWithUser } from "../../common/guards/role.guard";

@Controller('tabel')
@UseGuards(AuthGuard)
export class TabelController {
    constructor(private readonly service: TabelServic) {}

    // Bron qilingan/bo'sh stollarni ko'rish uchun har kim (login qilmagan mijoz ham) ko'ra oladi.
    // Query: ?atmosfera_id=&kun=&oy=&yil=&soat=&davomiylik_soat= — sana+soat+davomiylik
    // berilsa, javobdagi har bir stolda o'sha vaqt uchun "band" (true/false) qaytadi.
    @Get()
    async getAll(
        @Query('atmosfera_id') atmosfera_id?: string,
        @Query('kun') kun?: string,
        @Query('oy') oy?: string,
        @Query('yil') yil?: string,
        @Query('soat') soat?: string,
        @Query('davomiylik_soat') davomiylik_soat?: string,
    ) {
        return await this.service.getAll({
            atmosfera_id,
            kun: kun ? Number(kun) : undefined,
            oy,
            yil: yil ? Number(yil) : undefined,
            soat: soat ? Number(soat) : undefined,
            davomiylik_soat: davomiylik_soat ? Number(davomiylik_soat) : undefined,
        });
    }

    @Get(':id')
    async getOne(@Param('id') id: string) {
        return await this.service.getOne(id);
    }

    @Post()
    @Protected()
    async create(@Body() dto: CreateTabelDto, @Req() req: RequestWithUser) {
        return await this.service.create(dto, req);
    }

    // Admin uchun: bir zumda N ta stol yaratish (masalan "6 ta stol")
    @Post('bulk')
    @Protected()
    async createBulk(
        @Body('atmosfera_id') atmosfera_id: string,
        @Body('count') count: number,
        @Req() req: RequestWithUser,
    ) {
        return await this.service.createBulk(atmosfera_id, count, req);
    }

    @Patch(':id')
    @Protected()
    async update(@Param('id') id: string, @Body() dto: UpdateTabelDto, @Req() req: RequestWithUser) {
        return await this.service.update(id, dto, req);
    }

    @Delete(':id')
    @Protected()
    async delete(@Param('id') id: string, @Req() req: RequestWithUser) {
        return await this.service.delete(id, req);
    }
}
