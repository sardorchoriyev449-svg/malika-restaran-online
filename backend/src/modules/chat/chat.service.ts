import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Message, SenderRole } from "./model/message.model";
import { Users } from "../users/model/user.model";
import { SendMessageDto } from "./dtos/send-message.dto";
import { RequestWithUser } from "../../common/guards/role.guard";
import { UserRoles } from "../../common/guards/user-role.guard";
import { ChatGateway } from "./chat.gateway";

@Injectable()
export class ChatService {
    constructor(
        @InjectModel(Message.name) private readonly model: Model<Message>,
        @InjectModel(Users.name) private readonly userModel: Model<Users>,
        private readonly gateway: ChatGateway,
    ) {}

    // Mijoz o'z suhbatini ko'radi (o'zi yozgan + adminlardan kelgan xabarlar)
    async getMyConversation(req: RequestWithUser) {
        const messages = await this.model
            .find({ user_id: req.user.id })
            .sort({ createdAt: 1 });

        await this.model.updateMany(
            { user_id: req.user.id, sender_role: SenderRole.admin, read_by_user: false },
            { read_by_user: true },
        );

        return messages;
    }

    // Mijoz supportga (adminlarga) xabar yozadi
    async sendAsClient(dto: SendMessageDto, req: RequestWithUser) {
        const message = await this.model.create({
            user_id: req.user.id,
            sender_id: req.user.id,
            sender_role: SenderRole.client,
            text: dto.text,
            image_url: dto.image_url,
            read_by_user: true,
            read_by_admin: false,
        });

        // Diqqat: socket orqali RAW (populyatsiya qilinmagan) xabar yuboramiz —
        // frontend `msg.user_id`ni oddiy string sifatida solishtiradi. Agar
        // bu yerda populate qilib yuborilsa, user_id obyektga aylanib,
        // taqqoslash hech qachon mos kelmay qoladi va real-vaqt yangilanish
        // ishlamay qoladi.
        this.gateway.emitNewMessage(message);

        return { success: true, data: message };
    }

    // Admin — barcha mijozlar bilan suhbatlar ro'yxati (oxirgi xabar + o'qilmagan soni bilan)
    async getConversations(req: RequestWithUser) {
        if (req.user.role !== UserRoles.admin) return { success: false, message: 'Faqat Admin!' };

        const conversations = await this.model.aggregate([
            { $sort: { createdAt: -1 } },
            {
                $group: {
                    _id: '$user_id',
                    lastMessage: { $first: '$text' },
                    lastIsImage: { $first: { $cond: [{ $ifNull: ['$image_url', false] }, true, false] } },
                    lastAt: { $first: '$createdAt' },
                    unread: {
                        $sum: {
                            $cond: [
                                { $and: [{ $eq: ['$sender_role', SenderRole.client] }, { $eq: ['$read_by_admin', false] }] },
                                1,
                                0,
                            ],
                        },
                    },
                },
            },
            { $sort: { lastAt: -1 } },
        ]);

        const userIds = conversations.map((c) => c._id);
        const users = await this.userModel.find({ _id: { $in: userIds } }).select('fullName phone');
        const userMap = new Map(users.map((u) => [u._id.toString(), u]));

        return conversations.map((c) => ({
            user: userMap.get(c._id.toString()) ?? null,
            lastMessage: c.lastMessage || (c.lastIsImage ? '📎 Rasm' : ''),
            lastAt: c.lastAt,
            unread: c.unread,
        }));
    }

    // Admin — muayyan mijoz bilan suhbatni ochadi
    async getConversation(userId: string, req: RequestWithUser) {
        if (req.user.role !== UserRoles.admin) return { success: false, message: 'Faqat Admin!' };

        const messages = await this.model
            .find({ user_id: new Types.ObjectId(userId) })
            .sort({ createdAt: 1 });

        await this.model.updateMany(
            { user_id: new Types.ObjectId(userId), sender_role: SenderRole.client, read_by_admin: false },
            { read_by_admin: true },
        );

        return messages;
    }

    // Admin — mijozga javob yozadi
    async sendAsAdmin(userId: string, dto: SendMessageDto, req: RequestWithUser) {
        if (req.user.role !== UserRoles.admin) return { success: false, message: 'Faqat Admin!' };

        const message = await this.model.create({
            user_id: new Types.ObjectId(userId),
            sender_id: req.user.id,
            sender_role: SenderRole.admin,
            text: dto.text,
            image_url: dto.image_url,
            read_by_admin: true,
            read_by_user: false,
        });

        this.gateway.emitNewMessage(message);

        return { success: true, data: message };
    }
}
