import { Controller, Post, Body, Param, Get, Delete, Patch, Req, UseGuards } from "@nestjs/common";
import { CategoryService } from "./category.service";
import { CreateCategoryDto } from "./dto/category.dto";
import { UpdateCategoryDto } from "./dto/category.update";
import { AuthGuard } from "../../common/guards/auth.guard";
import { Protected } from "../../common/guards/protected.guard";
import { RolesGuard, type RequestWithUser } from "../../common/guards/role.guard";

@Controller('category')
@UseGuards(AuthGuard)
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  // Menyu kategoriyalarini har kim (login qilmagan mijoz ham) ko'ra olishi kerak
  @Get('all')
  async getAllCategories() {
    return this.categoryService.getAll();
  }

  @Get(':id')
  async getOneCategory(@Param('id') id: string) {
    return this.categoryService.getOne(id);
  }

  @Post('create')
  @Protected()
  async createCategory(@Body() dto: CreateCategoryDto, @Req() req: RequestWithUser) {
    return this.categoryService.create(dto, req);
  }

  @Patch('update/:id')
  @Protected()
  async updateCategory(@Param('id') id: string, @Body() dto: UpdateCategoryDto, @Req() req: RequestWithUser) {
    return this.categoryService.update(id, dto, req);
  }

  @Delete('delete/:id')
  @Protected()
  async deleteCategory(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.categoryService.delete(id, req);
  }
}
