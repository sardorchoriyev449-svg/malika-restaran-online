import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Atmosfera } from "./model/atmosfera.model";
import { CreateAtmosferaDto } from "./dtos/atmosfera-create.dto";
import { UpdateAtmosferaDto } from "./dtos/atmosfera-update.dto";
import { RequestWithUser } from "../../common/guards/role.guard";
import { UserRoles } from "../../common/guards/user-role.guard";

@Injectable()
export class AtmosferaService {
    constructor(
        @InjectModel(Atmosfera.name) private readonly model: Model<Atmosfera>,
    ) {}

    async getAll() {
        return await this.model.find();
    }

    async getOne(id: string) {
        const result = await this.model.findById(id);
        if (!result) return { success: false, message: `Topilmadi!` };
        return { success: true, data: result };
    }

    async create(dto: CreateAtmosferaDto, req: RequestWithUser) {
        if (req.user.role !== UserRoles.admin) return { success: false, message: 'Faqat Admin!' };

        const existing = await this.model.findOne({ atmosfera: dto.atmosfera });
        if (existing) return { success: false, message: `${dto.atmosfera} bunday nomda atmosfera bor!` };

        const created = await this.model.create(dto);
        return { success: true, message: `Mufaqayatli qo'shildi!`, data: created };
    }

    async update(id: string, dto: UpdateAtmosferaDto, req: RequestWithUser) {
        if (req.user.role !== UserRoles.admin) return { success: false, message: 'Faqat Admin!' };

        const existing = await this.model.findById(id);
        if (!existing) return { success: false, message: `Topilmadi!` };

        const updated = await this.model.findByIdAndUpdate(id, {
            atmosfera: dto.atmosfera ?? existing.atmosfera,
            zalog_summasi: dto.zalog_summasi ?? existing.zalog_summasi,
            xizmat_haqi_foizi: dto.xizmat_haqi_foizi ?? existing.xizmat_haqi_foizi,
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
