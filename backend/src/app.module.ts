import { Module, UseGuards } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { dbConnect } from './common/configs/db.config';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/users/user.module';
import { AddressModule } from './modules/addres/address.module';
import { AuthGuard } from './common/guards/auth.guard';
import { APP_GUARD } from '@nestjs/core';
import { RedisModule } from './common/redis/redis.module';
import { CategoryModule } from './modules/categories/category.module';
import { ProductModule } from './modules/products/products.module';
import { OrderModule } from './modules/orders/order.module';
import { TabelModule } from './modules/tabels/tabel.module';
import { AtmosferaModule } from './modules/atmosfera/atmosfera.module';
import { UploadModule } from './common/upload/upload.module';
import { ChatModule } from './modules/chat/chat.module';
import { RolesGuard } from './common/guards/role.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal:true
    }),
    JwtModule.register({
      global:true
    }),
    MongooseModule.forRoot(dbConnect()),
    AuthModule,
    UserModule,
    AddressModule,
    RedisModule,
    CategoryModule,
    ProductModule,
    OrderModule,
    TabelModule,
    AtmosferaModule,
    UploadModule,
    ChatModule,
  ],
  providers:[
    {
      useClass:AuthGuard,
      provide:APP_GUARD,
    }
  ]
})
export class AppModule {}
