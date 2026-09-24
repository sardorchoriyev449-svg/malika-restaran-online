import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Product } from "./model/products.moduel";
import { Model } from "mongoose";
import { ProductUpdateDtos } from "./dtos/product-update.dtos";
import { CreateProductDtos } from "./dtos/product-create";
import { RequestWithUser } from "../../common/guards/role.guard";
import { UserRoles } from "../../common/guards/user-role.guard";

@Injectable()
export class ProductService{
    constructor(
        @InjectModel(Product.name) private readonly model:Model<Product>,
    ){}

    async getAll(){
        return await this.model.find()
    }
    async getOne(id:string){
        const resoult = await this.model.findById(id)

        if(!resoult) return {success:false, message:`Topilmadi!`}

        return {success:true, data:resoult}
    }
    async create(dtos:CreateProductDtos, req:RequestWithUser){
        if(req.user.role !== UserRoles.admin) return {success:false, message:'Faqat Admin!'};
        const resoult = await this.model.findOne({title:dtos.title})

        if(resoult) return {success:false, message:`${dtos.title} bunday nomda maxsulot bor!`}

        await this.model.create({
            ...dtos
        })
        return {success:true, message:`Maxsulot mufaqayatli qo\'shildi!`}

    }
    async delete(id:string, req:RequestWithUser){

        if(req.user.role !== UserRoles.admin) return {success:false, message:'Faqat Admin!'};

        const resoult = await this.model.findByIdAndDelete(id)

        if(!resoult) return {success:false, message:`Topilmadi!`}

        return {success:true, message:`Mufaqayatli Tozalandi!`}
    }
    async update(id:string, dtos:ProductUpdateDtos, req:RequestWithUser){
        
        if(req.user.role !== UserRoles.admin) return {success:false, message:'Faqat Admin!'};

        const resoult = await this.model.findById(id)

        if(!resoult) return {success:false, message:`Topilmadi!`}

        await this.model.findByIdAndUpdate(id,{
            title: dtos.title ?? resoult.title,
            price: dtos.price ?? resoult.price,
            category_id: dtos.category_id ?? resoult.category_id,
            discriptions: dtos.discriptions ?? resoult.discriptions,
            image_url: dtos.image_url ?? resoult.image_url,
        })

        return {success:true, message:`Mufaqayatli Yangilandi!`}
    }
    
}