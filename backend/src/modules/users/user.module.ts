import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { UserService } from "./user.service";
import { UserController } from "./user.controller";
import { Users, UserSchema } from "./model/user.model";
import { Address, AddressSchema } from "../addres/model/address.model";

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Users.name, schema: UserSchema }, 
            { name: Address.name, schema: AddressSchema 
        }]),
    ],
    providers: [UserService],
    controllers: [UserController],
    exports: [UserService],
})
export class UserModule { }