import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Order, OrderSchema } from "./model/order.model";
import { Users, UserSchema } from "../users/model/user.model";
import { Product, ProductSchema } from "../products/model/products.moduel";
import { Category, CategorySchema } from "../categories/model/category.model";
import { OrderController } from "./order.controller";
import { OrderService } from "./order.service";
import { OrderGateway } from "./order.gateway";
import { TelegramService } from "../../common/telegram/telegram.service";

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Order.name, schema: OrderSchema },
            { name: Users.name, schema: UserSchema },
            { name: Product.name, schema: ProductSchema },
            { name: Category.name, schema: CategorySchema },
        ]),
    ],
    controllers: [OrderController],
    providers: [OrderService, OrderGateway, TelegramService],
})
export class OrderModule {}