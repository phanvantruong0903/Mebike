import { Module } from '@nestjs/common';
import { ConsulModule, JwtSharedModule, RedisModule } from '@mebike/common';
import { ConfigModule } from '@nestjs/config';
import { SupplierController } from './supplier.controller';
import { SupplierService } from './supllier.service';

@Module({
  imports: [
    ConsulModule,
    RedisModule,
    JwtSharedModule,
    ConfigModule.forRoot({ isGlobal: true }),
  ],
  controllers: [SupplierController],
  providers: [SupplierService],
})
export class SupplierModule {}
