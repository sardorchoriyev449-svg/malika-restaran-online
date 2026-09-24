import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Category } from "./model/category.model";
import { CreateCategoryDto } from "./dto/category.dto";
import { UpdateCategoryDto } from "./dto/category.update";
import { RequestWithUser } from "../../common/guards/role.guard";
import { UserRoles } from "../../common/guards/user-role.guard";

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(Category.name) private readonly categoryModel: Model<Category>,
  ) {}

  async create(dto: CreateCategoryDto, req: RequestWithUser) {
    if (req.user.role !== UserRoles.admin) return { success: false, message: 'Faqat Admin!' };

    const existingCategory = await this.categoryModel.findOne({ name: dto.name });
    if (existingCategory) return { success: false, message: `Bunday nomda categorya bor!` };

    const newCategory = new this.categoryModel(dto);
    const saved = await newCategory.save();
    return { success: true, message: `Mufaqayatli qo'shildi!`, data: saved };
  }

  async getAll() {
    return await this.categoryModel.find().lean().exec();
  }

  async getOne(id: string) {
    const category = await this.categoryModel.findById(id).lean().exec();

    if (!category) return { success: false, message: `Topilmadi!` };

    return { success: true, data: category };
  }

  async update(id: string, dto: UpdateCategoryDto, req: RequestWithUser) {
    if (req.user.role !== UserRoles.admin) return { success: false, message: 'Faqat Admin!' };

    const updatedCategory = await this.categoryModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();

    if (!updatedCategory) return { success: false, message: `Topilmadi!` };

    return { success: true, message: `Mufaqayatli Yangilandi!`, data: updatedCategory };
  }

  async delete(id: string, req: RequestWithUser) {
    if (req.user.role !== UserRoles.admin) return { success: false, message: 'Faqat Admin!' };

    const deletedCategory = await this.categoryModel.findByIdAndDelete(id).exec();

    if (!deletedCategory) return { success: false, message: `Topilmadi!` };

    return { success: true, message: `Mufaqayatli Tozalandi!` };
  }
}
