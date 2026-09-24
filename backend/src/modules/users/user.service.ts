import { Injectable, UseGuards } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Users } from "./model/user.model";
import { Model } from "mongoose";
import { UserUpdate } from "./dtos/user.update.dto";
import { RequestWithUser } from "../../common/guards/role.guard";
import { UserRoles } from "../../common/guards/user-role.guard";
import { Address } from "../addres/model/address.model";
import { AuthGuard } from "../../common/guards/auth.guard";

@Injectable()
export class UserService{
    constructor(
        @InjectModel(Users.name) private readonly model:Model<Users>,
        @InjectModel(Address.name) private readonly addressModel:Model<Address>,
    ){}

    async getAll(req: RequestWithUser, search?: string){
        if(req.user.role !== UserRoles.admin) return {success:false, message:'Faqat Admin!'};

        const filter = search
            ? { $or: [
                { fullName: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } },
              ] }
            : {};

        const users = await this.model.find(filter).select('-password').sort({ createdAt: -1 });

        const userIds = users.map(u => u._id);
        const addresses = await this.addressModel.find({ user_id: { $in: userIds } }).sort({ createdAt: -1 });

        const addressesByUser: Record<string, any[]> = {};
        for (const a of addresses) {
            const key = a.user_id.toString();
            if (!addressesByUser[key]) addressesByUser[key] = [];
            addressesByUser[key].push(a);
        }

        return users.map(u => ({
            ...u.toObject(),
            addresses: addressesByUser[u._id.toString()] || [],
        }));
    }

    async getOne(id:string, req: RequestWithUser){
        if(req.user.role !== UserRoles.admin) return {success:false, message:'Faqat Admin!'};

        const resoult = await this.model.findById(id).select('-password')

        if(!resoult) return {success:false, message:`Topilmadi!`}

        const addresses = await this.addressModel.find({ user_id: id }).sort({ createdAt: -1 });

        return {success:true, data:{...resoult.toObject(), addresses}}
    }
    async delete(id:string, req: RequestWithUser){
        if(req.user.role !== UserRoles.admin) return {success:false, message:'Faqat Admin!'};

        if(req.user.id === id) return {success:false, message:'O\'zingizni o\'chira olmaysiz!'};

        const resoult = await this.model.findByIdAndDelete(id)

        if(!resoult) return {success:false, message:`Topilmadi!`}

        return {success:true, message:`Mufaqayatli Tozalandi!`}
    }
    async update(id:string, dtos:UserUpdate, req: RequestWithUser){
        if(req.user.role !== UserRoles.admin) return {success:false, message:'Faqat Admin!'};

        const existing = await this.model.findById(id);
        if(!existing) return {success:false, message:`Topilmadi!`}

        const resoult = await this.model.findByIdAndUpdate(id,{
            fullName: dtos.fullName ?? existing.fullName,
            role: dtos.role ?? existing.role,
        }, { new: true })

        return {success:true, message:`Mufaqayatli Yangilandi!`, data:resoult}
    }
}