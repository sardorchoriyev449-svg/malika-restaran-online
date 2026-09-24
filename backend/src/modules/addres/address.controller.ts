import { Body, Controller, Delete, Get, Param, Post, Req, UseGuards } from "@nestjs/common";
import { AddressService } from "./address.service";
import { CreateAddressDto } from "./dtos/address-create.dtos";
import { AuthGuard } from "../../common/guards/auth.guard";
import { Protected } from "../../common/guards/protected.guard";
import { RolesGuard, type RequestWithUser } from "../../common/guards/role.guard";

@Controller('address')
@UseGuards(AuthGuard)
@Protected()
export class AddressController {
    constructor(private readonly service: AddressService) {}

    @Post()
    async create(@Body() dto: CreateAddressDto, @Req() req: RequestWithUser) {
        return await this.service.create(dto, req);
    }

    @Get()
    async getMine(@Req() req: RequestWithUser) {
        return await this.service.getMine(req);
    }

    @Delete(':id')
    async delete(@Param('id') id: string, @Req() req: RequestWithUser) {
        return await this.service.delete(id, req);
    }
}