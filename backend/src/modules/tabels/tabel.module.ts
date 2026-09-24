import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Tabel, TabelSchema } from "./model/tabel.model";
import { Order, OrderSchema } from "../orders/model/order.model";
import { Atmosfera, AtmosferaSchema } from "../atmosfera/model/atmosfera.model";
import { TabelServic } from "./tabel.service";
import { TabelController } from "./tabel.controller";

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Tabel.name, schema: TabelSchema },
            { name: Order.name, schema: OrderSchema },
            { name: Atmosfera.name, schema: AtmosferaSchema },
        ]),
    ],
    controllers: [TabelController],
    providers: [TabelServic],
    exports: [TabelServic],
})
export class TabelModule {}
