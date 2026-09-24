import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Order, OrderStatus, ReservationApproval } from "./model/order.model";
import { CreateOrderDto } from "./dtos/order-create.dtos";
import { RequestWithUser } from "../../common/guards/role.guard";
import { UserRoles } from "../../common/guards/user-role.guard";
import { Users } from "../users/model/user.model";
import { Product } from "../products/model/products.moduel";
import { Category } from "../categories/model/category.model";
import { OrderGateway } from "./order.gateway";
import { TelegramService } from "../../common/telegram/telegram.service";

// Stol bo'shagandan keyin uni yig'ishtirish/tozalash uchun kerak bo'ladigan vaqt.
// Shu sababli ikkita bron orasida kamida shuncha soat farq bo'lishi shart.
export const TABLE_CLEANUP_BUFFER_HOURS = 1;

export function reservationsConflict(
    aStart: number, aEnd: number,
    bStart: number, bEnd: number,
    buffer = TABLE_CLEANUP_BUFFER_HOURS,
): boolean {
    return aStart < bEnd + buffer && bStart < aEnd + buffer;
}

@Injectable()
export class OrderService {
    constructor(
        @InjectModel(Order.name) private readonly model: Model<Order>,
        @InjectModel(Users.name) private readonly userModel: Model<Users>,
        @InjectModel(Product.name) private readonly productModel: Model<Product>,
        @InjectModel(Category.name) private readonly categoryModel: Model<Category>,
        private readonly gateway: OrderGateway,
        private readonly telegram: TelegramService,
    ) {}

    async create(dto: CreateOrderDto, req: RequestWithUser) {
        if (!dto.address && !dto.tabel_id) {
            return {
                success: false,
                message: "Yetkazib berish uchun manzil, yoki restoranda ovqatlanish uchun stol tanlanishi shart!",
            };
        }

        if (dto.tabel_id) {
            if (
                dto.bron_kun == null || !dto.bron_oy || dto.bron_yil == null ||
                dto.bron_soat == null || dto.bron_davomiylik_soat == null
            ) {
                return {
                    success: false,
                    message: "Stol uchun sana, soat va davomiylik (necha soat o'tirishi) ko'rsatilishi shart!",
                };
            }

            const newStart = dto.bron_soat;
            const newEnd = dto.bron_soat + dto.bron_davomiylik_soat;

            const sameDayOrders = await this.model.find({
                tabel_id: dto.tabel_id,
                bron_kun: dto.bron_kun,
                bron_oy: dto.bron_oy,
                bron_yil: dto.bron_yil,
                status: { $nin: [OrderStatus.cancelled, OrderStatus.delivered] },
                approval_status: { $ne: ReservationApproval.rejected },
            });

            const conflict = sameDayOrders.some((o) => {
                const existingStart = o.bron_soat ?? 0;
                const existingEnd = existingStart + (o.bron_davomiylik_soat ?? 1);
                return reservationsConflict(newStart, newEnd, existingStart, existingEnd);
            });

            if (conflict) {
                return {
                    success: false,
                    message: `Afsuski, bu stol shu vaqt oralig'ida band (stolni yig'ishtirish uchun har bir bron atrofida ${TABLE_CLEANUP_BUFFER_HOURS} soat bo'sh vaqt kerak). Iltimos, boshqa vaqt yoki stol tanlang.`,
                };
            }
        }

        const total = dto.items.reduce((sum, item) => sum + item.price * item.qty, 0);

        const order = await this.model.create({
            user_id: req.user.id,
            items: dto.items,
            address: dto.address,
            tabel_id: dto.tabel_id,
            bron_kun: dto.bron_kun,
            bron_oy: dto.bron_oy,
            bron_yil: dto.bron_yil,
            bron_soat: dto.bron_soat,
            bron_davomiylik_soat: dto.bron_davomiylik_soat,
            // Stol bilan berilgan buyurtmalar xazillashib/soxta bron qilishning
            // oldini olish uchun avval admin tasdig'ini kutadi. Onlayn
            // buyurtmalar uchun bu tekshiruv shart emas.
            // Agar buyurtmani ADMIN (ofitsiant/Afitsant paneli) yaratayotgan bo'lsa,
            // tasdiqlash navbatiga tushmaydi — xodim jismonan restoranda, mijoz
            // ko'z oldida stolni bevosita band qiladi.
            approval_status: dto.tabel_id
                ? (req.user.role === UserRoles.admin ? ReservationApproval.confirmed : ReservationApproval.pendingReview)
                : undefined,
            total,
        });

        const populatedOrder = await this.model
            .findById(order._id)
            .populate('user_id', 'fullName phone')
            .populate('tabel_id');

        // Admin panelga real vaqtda xabar beramiz
        this.gateway.emitNewOrder(populatedOrder);
        if (dto.tabel_id && req.user.role !== UserRoles.admin) {
            // Admin "Bron" sahifasi aynan shu eventni kutib turadi
            this.gateway.emitNewReservationRequest(populatedOrder);
        }
        // Telegramga ham chiroyli formatlangan xabarnoma yuboramiz
        this.telegram.sendOrderNotification(populatedOrder);

        return {
            success: true,
            message: dto.tabel_id && req.user.role !== UserRoles.admin
                ? "So'rovingiz qabul qilindi! Stol bron qilinishi uchun admin tasdig'ini kuting — tez orada siz bilan bog'lanadi."
                : 'Buyurtma qabul qilindi!',
            data: order,
        };
    }

    async getAll(req: RequestWithUser) {
        if (req.user.role !== UserRoles.admin) return { success: false, message: 'Faqat Admin!' };
        return await this.model
            .find()
            .populate('user_id', 'fullName phone')
            .populate({ path: 'tabel_id', populate: { path: 'atmosfera_id' } })
            .sort({ createdAt: -1 });
    }

    // Foydalanuvchining o'z buyurtmalari ("Buyurtmalarim" sahifasi uchun)
    async getMine(req: RequestWithUser) {
        return await this.model
            .find({ user_id: req.user.id })
            .populate({ path: 'tabel_id', populate: { path: 'atmosfera_id' } })
            .sort({ createdAt: -1 });
    }

    // Foydalanuvchi o'z buyurtmasini FAQAT birinchi 20 daqiqa ichida va u
    // hali "PENDING" holatida bo'lsa bekor qila oladi.
    async cancel(id: string, req: RequestWithUser) {
        const isAdmin = req.user.role === UserRoles.admin;

        // Admin istalgan buyurtmani bekor qila oladi (vaqt chegarasisiz);
        // oddiy foydalanuvchi esa faqat o'zining buyurtmasini, 20 daqiqa ichida
        const order = isAdmin
            ? await this.model.findById(id)
            : await this.model.findOne({ _id: id, user_id: req.user.id });

        if (!order) return { success: false, message: 'Buyurtma topilmadi' };

        if (order.status === OrderStatus.cancelled) {
            return { success: false, message: 'Bu buyurtma allaqachon bekor qilingan' };
        }

        if (!isAdmin) {
            const minutesPassed = (Date.now() - (order as any).createdAt.getTime()) / 60000;
            if (minutesPassed > 20) {
                return { success: false, message: 'Bekor qilish vaqti tugagan (buyurtmadan 20 daqiqadan ko\'p vaqt o\'tgan)' };
            }
        }

        order.status = OrderStatus.cancelled;
        await order.save();

        this.gateway.emitOrderCancelled(order._id.toString());

        return { success: true, message: 'Buyurtma bekor qilindi', data: order };
    }

    // Admin buyurtma holatini bosqichma-bosqich o'zgartiradi
    // (Kutilmoqda -> Tayyorlanmoqda -> Yetkazilmoqda -> Yetkazildi)
    async updateStatus(id: string, status: OrderStatus, req: RequestWithUser) {
        if (req.user.role !== UserRoles.admin) return { success: false, message: 'Faqat Admin!' };

        const order = await this.model.findById(id);
        if (!order) return { success: false, message: 'Buyurtma topilmadi' };

        if (order.status === OrderStatus.cancelled || order.status === OrderStatus.delivered) {
            return { success: false, message: 'Bu buyurtma holatini endi o\'zgartirib bo\'lmaydi' };
        }

        order.status = status;
        await order.save();

        this.gateway.emitOrderStatusChanged(order._id.toString(), status);

        return { success: true, message: 'Holat yangilandi', data: order };
    }

    // Ofitsiant (Afitsant) paneli — stolda o'tirgan mijozga qo'shimcha taom qo'shadi
    async addItems(id: string, items: CreateOrderDto['items'], req: RequestWithUser) {
        if (req.user.role !== UserRoles.admin) return { success: false, message: 'Faqat Admin!' };

        const order = await this.model.findById(id);
        if (!order) return { success: false, message: 'Buyurtma topilmadi' };

        if (order.status === OrderStatus.cancelled || order.status === OrderStatus.delivered) {
            return { success: false, message: 'Bu buyurtmaga endi taom qo\'shib bo\'lmaydi' };
        }

        order.items.push(
            ...items.map((item) => ({ ...item, product_id: new Types.ObjectId(item.product_id) })),
        );
        order.total = order.items.reduce((sum, item) => sum + item.price * item.qty, 0);
        await order.save();

        this.gateway.emitOrderStatusChanged(order._id.toString(), order.status);

        return { success: true, message: 'Taomlar qo\'shildi', data: order };
    }

    // Admin — hali tasdiqlanmagan (yoki rad etilmagan) stol bron so'rovlari ro'yxati
    async getReservationRequests(req: RequestWithUser) {
        if (req.user.role !== UserRoles.admin) return { success: false, message: 'Faqat Admin!' };

        return await this.model
            .find({ approval_status: ReservationApproval.pendingReview })
            .populate('user_id', 'fullName phone')
            .populate({ path: 'tabel_id', populate: { path: 'atmosfera_id' } })
            .sort({ createdAt: -1 });
    }

    // Admin — mijoz to'lov skrinshotini ko'rib, broni tasdiqlaydi
    async approveReservation(id: string, zalogTolandi: number | undefined, req: RequestWithUser) {
        if (req.user.role !== UserRoles.admin) return { success: false, message: 'Faqat Admin!' };

        const order = await this.model.findById(id);
        if (!order) return { success: false, message: 'So\'rov topilmadi' };
        if (order.approval_status !== ReservationApproval.pendingReview) {
            return { success: false, message: 'Bu so\'rov allaqachon ko\'rib chiqilgan' };
        }

        order.approval_status = ReservationApproval.confirmed;
        if (zalogTolandi != null) order.zalog_tolandi = zalogTolandi;
        await order.save();

        const populatedOrder = await this.model
            .findById(order._id)
            .populate('user_id', 'fullName phone')
            .populate({ path: 'tabel_id', populate: { path: 'atmosfera_id' } });

        this.gateway.emitReservationDecided(populatedOrder);

        return { success: true, message: 'Bron tasdiqlandi!', data: order };
    }

    // Admin — soxta/hazil so'rovni yoki to'lov qilinmagan bronni rad etadi
    // (stol darhol boshqalar uchun bo'shaydi)
    async rejectReservation(id: string, req: RequestWithUser) {
        if (req.user.role !== UserRoles.admin) return { success: false, message: 'Faqat Admin!' };

        const order = await this.model.findById(id);
        if (!order) return { success: false, message: 'So\'rov topilmadi' };
        if (order.approval_status !== ReservationApproval.pendingReview) {
            return { success: false, message: 'Bu so\'rov allaqachon ko\'rib chiqilgan' };
        }

        order.approval_status = ReservationApproval.rejected;
        order.status = OrderStatus.cancelled;
        await order.save();

        const populatedOrder = await this.model
            .findById(order._id)
            .populate('user_id', 'fullName phone')
            .populate({ path: 'tabel_id', populate: { path: 'atmosfera_id' } });

        this.gateway.emitReservationDecided(populatedOrder);

        return { success: true, message: 'So\'rov rad etildi', data: order };
    }

    async getStats(req: RequestWithUser) {
        if (req.user.role !== UserRoles.admin) return { success: false, message: 'Faqat Admin!' };

        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        const [userCount, productCount, categoryCount, orderCount, todayOrders, monthOrders, allOrders] = await Promise.all([
            this.userModel.countDocuments(),
            this.productModel.countDocuments(),
            this.categoryModel.countDocuments(),
            this.model.countDocuments(),
            this.model.find({ createdAt: { $gte: startOfDay }, status: { $ne: OrderStatus.cancelled } }),
            this.model.find({ createdAt: { $gte: startOfMonth }, status: { $ne: OrderStatus.cancelled } }),
            this.model.find({ status: { $ne: OrderStatus.cancelled } }),
        ]);

        const revenueToday = todayOrders.reduce((sum, o) => sum + o.total, 0);
        const revenueThisMonth = monthOrders.reduce((sum, o) => sum + o.total, 0);
        const revenueTotal = allOrders.reduce((sum, o) => sum + o.total, 0);

        return {
            success: true,
            data: {
                userCount,
                productCount,
                categoryCount,
                orderCount,
                ordersToday: todayOrders.length,
                ordersThisMonth: monthOrders.length,
                revenueToday,
                revenueThisMonth,
                revenueTotal,
            },
        };
    }
}