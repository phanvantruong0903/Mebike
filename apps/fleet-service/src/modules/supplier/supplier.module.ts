import { Module } from '@nestjs/common';
import { ConsuleModule, JwtSharedModule, RedisModule } from '@mebike/common';
import { ConfigModule } from '@nestjs/config';
import { SupplierController } from './supplier.controller';
import { SupplierService } from './supllier.service';

@Module({
  imports: [
    ConsuleModule,
    RedisModule,
    JwtSharedModule,
    ConfigModule.forRoot({ isGlobal: true }),
  ],
  controllers: [SupplierController],
  providers: [SupplierService],
})
export class SupplierModule {}
