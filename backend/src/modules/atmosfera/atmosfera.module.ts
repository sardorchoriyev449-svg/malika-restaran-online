import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Atmosfera, AtmosferaSchema } from "./model/atmosfera.model";
import { AtmosferaService } from "./atmosfera.service";
import { AtmosferaController } from "./atmosfera.controller";

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Atmosfera.name, schema: AtmosferaSchema }]),
    ],
    controllers: [AtmosferaController],
    providers: [AtmosferaService],
    exports: [AtmosferaService],
})
export class AtmosferaModule {}
