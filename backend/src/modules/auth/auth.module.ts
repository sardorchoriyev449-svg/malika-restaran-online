import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AuthController } from "./auth.controller";
import { JwtModule } from "@nestjs/jwt";
import { RedisModule } from "../../common/redis/redis.module";
import { SmsModule } from "../../common/sms/sms.module";
import { Users, UserSchema } from "../users/model/user.model";
import { AuthService } from "./auth.service";

@Module({
    imports:[
        MongooseModule.forFeature([{name:Users.name, schema:UserSchema}]),
        JwtModule,
        RedisModule,
        SmsModule,
    ],
    controllers:[AuthController],
    providers:[AuthService],
    exports:[AuthService]
})
export class AuthModule{}