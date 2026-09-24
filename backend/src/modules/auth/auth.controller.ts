import { Body, Controller, Get, Post, Req, Res } from "@nestjs/common";
import { AuthService } from "./auth.service";
import type { Response } from "express";
import { Protected } from "../../common/guards/protected.guard";
import type { RequestWithUser } from "../../common/guards/role.guard";
import { RegisterDto } from "./dtos/register-dtos";
import { LoginDto } from "./dtos/login-dtos";
import { SendOtpDto } from "./dtos/send-otp.dto";

@Controller()
export class AuthController{
    constructor(
        private readonly service:AuthService,
    ){}

    @Post('send-otp')
    async sendOtp(@Body() dto: SendOtpDto){
        return await this.service.sendOtp(dto.phone)
    }
    @Post('sign-up')
    async regiseter(@Body() dtos:RegisterDto, @Res({ passthrough: true }) res:Response){
        return await this.service.register(dtos,res)
    }
    @Post('sign-in')
    async login(@Body() dtos:LoginDto, @Res({ passthrough: true }) res:Response){
        return await this.service.login(dtos,res)
    }
    @Post('logout')
    async logout(@Res({ passthrough: true }) res:Response){
        return await this.service.logout(res)
    }
    @Get('me')
    @Protected()
    async me(@Req() req: RequestWithUser){
        return await this.service.getMe(req.user.id)
    }
    @Get('contact-phone')
    async contactPhone(){
        return await this.service.getAdminContact()
    }
}