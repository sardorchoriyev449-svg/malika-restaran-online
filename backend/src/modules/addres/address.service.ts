import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Address } from "./model/address.model";
import { CreateAddressDto } from "./dtos/address-create.dtos";
import { RequestWithUser } from "../../common/guards/role.guard";

@Injectable()
export class AddressService {
    constructor(
        @InjectModel(Address.name) private readonly model: Model<Address>,
    ) {}

    async create(dto: CreateAddressDto, req: RequestWithUser) {
        const address = await this.model.create({ ...dto, user_id: req.user.id });
        return { success: true, data: address };
    }

    async getMine(req: RequestWithUser) {
        return await this.model.find({ user_id: req.user.id }).sort({ createdAt: -1 });
    }

    async delete(id: string, req: RequestWithUser) {
        const address = await this.model.findOne({ _id: id, user_id: req.user.id });
        if (!address) return { success: false, message: 'Manzil topilmadi' };
        await this.model.findByIdAndDelete(id);
        return { success: true, message: 'Manzil o\'chirildi' };
    }
}