import { Module } from '@nestjs/common';
import { ConsuleModule, JwtSharedModule } from '@loginex/common';
import { ConfigModule } from '@nestjs/config';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

@Module({
  imports: [
    ConsuleModule,
    JwtSharedModule,
    ConfigModule.forRoot({ isGlobal: true }),
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}
