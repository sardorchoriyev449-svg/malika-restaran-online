import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Tabel } from "./model/tabel.model";
import { Atmosfera } from "../atmosfera/model/atmosfera.model";
import { Order, OrderStatus, ReservationApproval } from "../orders/model/order.model";
import { reservationsConflict } from "../orders/order.service";
import { Model } from "mongoose";
import { CreateTabelDto } from "./dtos/tabel-create.dto";
import { UpdateTabelDto } from "./dtos/tabel-update.dto";
import { RequestWithUser } from "../../common/guards/role.guard";
import { UserRoles } from "../../common/guards/user-role.guard";

export interface AvailabilityQuery {
    atmosfera_id?: string;
    kun?: number;
    oy?: string;
    yil?: number;
    soat?: number;
    davomiylik_soat?: number;
}

function isOnlineAtmosfera(atmosfera: Atmosfera): boolean {
    return atmosfera.atmosfera.trim().toLowerCase() === 'online';
}

@Injectable()
export class TabelServic {
    constructor(
        @InjectModel(Tabel.name) private readonly model: Model<Tabel>,
        @InjectModel(Order.name) private readonly orderModel: Model<Order>,
        @InjectModel(Atmosfera.name) private readonly atmosferaModel: Model<Atmosfera>,
    ) {}

    // Sana berilgan bo'lsa, har bir stol uchun o'sha kunga tegishli barcha band
    // qilingan vaqt oraliqlarini ("bookings") qaytaradi — shunda mijoz bir marta
    // ko'rib, qaysi soat bo'sh ekanini darhol bilib oladi (har safar soat
    // o'zgartirib qidirishga hojat qolmaydi). Bundan tashqari, agar aniq
    // soat+davomiylik ham berilgan bo'lsa, SHU aniq oraliq uchun "band"
    // (true/false) ni ham qo'shib beradi.
    private async attachAvailability(tables: Tabel[], query: AvailabilityQuery) {
        const { kun, oy, yil, soat, davomiylik_soat } = query;
        const hasDateQuery = kun != null && !!oy && yil != null;

        if (!hasDateQuery) {
            return tables.map((t: any) => ({ ...t.toObject(), band: false, bookings: [] }));
        }

        const dayOrders = await this.orderModel.find({
            tabel_id: { $in: tables.map((t: any) => t._id) },
            bron_kun: kun,
            bron_oy: oy,
            bron_yil: yil,
            status: { $nin: [OrderStatus.cancelled, OrderStatus.delivered] },
            approval_status: { $ne: ReservationApproval.rejected },
        });

        const hasTimeQuery = soat != null && davomiylik_soat != null;
        const newStart = soat as number;
        const newEnd = newStart + (davomiylik_soat as number);

        return tables.map((t: any) => {
            const tableBookings = dayOrders
                .filter((o) => o.tabel_id?.toString() === t._id.toString())
                .map((o) => ({ soat: o.bron_soat ?? 0, davomiylik_soat: o.bron_davomiylik_soat ?? 1 }))
                .sort((a, b) => a.soat - b.soat);

            const band = hasTimeQuery
                ? tableBookings.some((b) => reservationsConflict(newStart, newEnd, b.soat, b.soat + b.davomiylik_soat))
                : false;

            return { ...t.toObject(), band, bookings: tableBookings };
        });
    }

    async getAll(query: AvailabilityQuery) {
        const filter: Record<string, unknown> = {};
        if (query.atmosfera_id) filter.atmosfera_id = query.atmosfera_id;

        const tables = await this.model.find(filter).populate('atmosfera_id').sort({ stol_raqami: 1 });
        return await this.attachAvailability(tables, query);
    }

    async getOne(id: string) {
        const result = await this.model.findById(id).populate('atmosfera_id');
        if (!result) return { success: false, message: `Topilmadi!` };
        return { success: true, data: result };
    }

    async create(dto: CreateTabelDto, req: RequestWithUser) {
        if (req.user.role !== UserRoles.admin) return { success: false, message: 'Faqat Admin!' };

        const atmosfera = await this.atmosferaModel.findById(dto.atmosfera_id);
        if (!atmosfera) return { success: false, message: 'Atmosfera topilmadi!' };
        if (isOnlineAtmosfera(atmosfera)) {
            return { success: false, message: `"Online" uchun stol qo'shib bo'lmaydi — bu yetkazib berish turi.` };
        }

        const existing = await this.model.findOne({
            atmosfera_id: dto.atmosfera_id,
            stol_raqami: dto.stol_raqami,
        });
        if (existing) return { success: false, message: `${dto.stol_raqami}-stol bu joyda allaqachon bor!` };

        const created = await this.model.create(dto);
        return { success: true, message: `Mufaqayatli qo'shildi!`, data: created };
    }

    // Admin bir zumda N ta stolni birdaniga yaratishi uchun (masalan "6 ta stol")
    async createBulk(atmosfera_id: string, count: number, req: RequestWithUser) {
        if (req.user.role !== UserRoles.admin) return { success: false, message: 'Faqat Admin!' };

        const atmosfera = await this.atmosferaModel.findById(atmosfera_id);
        if (!atmosfera) return { success: false, message: 'Atmosfera topilmadi!' };
        if (isOnlineAtmosfera(atmosfera)) {
            return { success: false, message: `"Online" uchun stol qo'shib bo'lmaydi — bu yetkazib berish turi.` };
        }

        const existingCount = await this.model.countDocuments({ atmosfera_id });
        const toCreate = Array.from({ length: count }, (_, i) => ({
            atmosfera_id,
            stol_raqami: existingCount + i + 1,
        }));

        const created = await this.model.insertMany(toCreate);
        return { success: true, message: `${count} ta stol qo'shildi!`, data: created };
    }

    async update(id: string, dto: UpdateTabelDto, req: RequestWithUser) {
        if (req.user.role !== UserRoles.admin) return { success: false, message: 'Faqat Admin!' };

        const existing = await this.model.findById(id);
        if (!existing) return { success: false, message: `Topilmadi!` };

        const updated = await this.model.findByIdAndUpdate(id, {
            atmosfera_id: dto.atmosfera_id ?? existing.atmosfera_id,
            stol_raqami: dto.stol_raqami ?? existing.stol_raqami,
        }, { new: true });

        return { success: true, message: `Mufaqayatli Yangilandi!`, data: updated };
    }

    async delete(id: string, req: RequestWithUser) {
        if (req.user.role !== UserRoles.admin) return { success: false, message: 'Faqat Admin!' };

        const deleted = await this.model.findByIdAndDelete(id);
        if (!deleted) return { success: false, message: `Topilmadi!` };

        return { success: true, message: `Mufaqayatli Tozalandi!` };
    }
}
