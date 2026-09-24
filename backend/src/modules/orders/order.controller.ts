import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from "@nestjs/common";
import { OrderService } from "./order.service";
import { CreateOrderDto, UpdateOrderStatusDto, AddOrderItemsDto } from "./dtos/order-create.dtos";
import { AuthGuard } from "../../common/guards/auth.guard";
import { Protected } from "../../common/guards/protected.guard";
import { RolesGuard, type RequestWithUser } from "../../common/guards/role.guard";

@Controller('order')
@UseGuards(AuthGuard)
export class OrderController {
    constructor(private readonly service: OrderService) {}

    // Buyurtma berish uchun mijoz tizimga kirgan bo'lishi kifoya (admin shart emas)
    @Post()
    @Protected()
    async create(@Body() dto: CreateOrderDto, @Req() req: RequestWithUser) {
        return await this.service.create(dto, req);
    }

    // Statistika va buyurtmalar ro'yxati faqat admin uchun (service ichida tekshiriladi)
    @Get('stats')
    @Protected()
    async stats(@Req() req: RequestWithUser) {
        return await this.service.getStats(req);
    }

    // Foydalanuvchining o'z buyurtmalari ("Buyurtmalarim" sahifasi)
    @Get('mine')
    @Protected()
    async getMine(@Req() req: RequestWithUser) {
        return await this.service.getMine(req);
    }

    // Admin "Bron" sahifasi — hali tasdiqlanmagan stol bron so'rovlari
    @Get('reservations')
    @Protected()
    async getReservationRequests(@Req() req: RequestWithUser) {
        return await this.service.getReservationRequests(req);
    }

    @Patch(':id/approve')
    @Protected()
    async approveReservation(
        @Param('id') id: string,
        @Body('zalog_tolandi') zalogTolandi: number | undefined,
        @Req() req: RequestWithUser,
    ) {
        return await this.service.approveReservation(id, zalogTolandi, req);
    }

    @Patch(':id/reject')
    @Protected()
    async rejectReservation(@Param('id') id: string, @Req() req: RequestWithUser) {
        return await this.service.rejectReservation(id, req);
    }

    @Patch(':id/cancel')
    @Protected()
    async cancel(@Param('id') id: string, @Req() req: RequestWithUser) {
        return await this.service.cancel(id, req);
    }

    @Patch(':id/status')
    @Protected()
    async updateStatus(@Param('id') id: string, @Body() dto: UpdateOrderStatusDto, @Req() req: RequestWithUser) {
        return await this.service.updateStatus(id, dto.status, req);
    }

    // Ofitsiant (Afitsant) paneli uchun — mavjud stol buyurtmasiga taom qo'shish
    @Patch(':id/items')
    @Protected()
    async addItems(@Param('id') id: string, @Body() dto: AddOrderItemsDto, @Req() req: RequestWithUser) {
        return await this.service.addItems(id, dto.items, req);
    }

    @Get()
    @Protected()
    async getAll(@Req() req: RequestWithUser) {
        return await this.service.getAll(req);
    }
}