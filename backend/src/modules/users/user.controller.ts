import { Body, Controller, Delete, Get, Param, Patch, Query, Req, UseGuards } from "@nestjs/common";
import { UserService } from "./user.service";
import { UserUpdate } from "./dtos/user.update.dto";
import { AuthGuard } from "../../common/guards/auth.guard";
import { Protected } from "../../common/guards/protected.guard";
import { RolesGuard, type RequestWithUser } from "../../common/guards/role.guard";

@Controller('user')
@UseGuards(AuthGuard)
@Protected()
export class UserController{
    constructor(
        private readonly service:UserService,
    ){}

    @Get()
    async getAll(@Req() req: RequestWithUser, @Query('search') search?: string){
        return await this.service.getAll(req, search);
    }
    @Get(':id')
    async getOne(@Param('id') id:string, @Req() req: RequestWithUser){
        return await this.service.getOne(id, req);
    }
    @Patch(':id')
    async update(@Param('id') id:string, @Body() dtos:UserUpdate, @Req() req: RequestWithUser){
        return await this.service.update(id, dtos, req);
    }
    @Delete(':id')
    async delete(@Param('id') id:string, @Req() req: RequestWithUser){
        return await this.service.delete(id, req);
    }
}