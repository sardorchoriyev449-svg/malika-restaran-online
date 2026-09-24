import { Body, Controller, Get, Param, Post, Req, UseGuards } from "@nestjs/common";
import { ChatService } from "./chat.service";
import { SendMessageDto } from "./dtos/send-message.dto";
import { AuthGuard } from "../../common/guards/auth.guard";
import { Protected } from "../../common/guards/protected.guard";
import { RolesGuard, type RequestWithUser } from "../../common/guards/role.guard";

@Controller('chat')
@UseGuards(AuthGuard)
@Protected()
export class ChatController {
    constructor(private readonly service: ChatService) {}

    // --- Mijoz tomoni ---
    @Get('me')
    async getMyConversation(@Req() req: RequestWithUser) {
        return await this.service.getMyConversation(req);
    }

    @Post('me')
    async sendAsClient(@Body() dto: SendMessageDto, @Req() req: RequestWithUser) {
        return await this.service.sendAsClient(dto, req);
    }

    // --- Admin tomoni ---
    @Get('conversations')
    async getConversations(@Req() req: RequestWithUser) {
        return await this.service.getConversations(req);
    }

    @Get(':userId')
    async getConversation(@Param('userId') userId: string, @Req() req: RequestWithUser) {
        return await this.service.getConversation(userId, req);
    }

    @Post(':userId')
    async sendAsAdmin(@Param('userId') userId: string, @Body() dto: SendMessageDto, @Req() req: RequestWithUser) {
        return await this.service.sendAsAdmin(userId, dto, req);
    }
}
