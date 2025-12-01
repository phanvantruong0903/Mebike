import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthController } from '../health/health.controller';
import { ConsuleModule } from '@loginex/common';
import { ProductsModule } from '../modules/products/products.module';
import { WarehouseModule } from '../modules/warehouse/warehouse.module';
import { ZoneModule } from '../modules/zone/zone.module';
import { RackModule } from '../modules/rack/rack.module';
import { BinModule } from '../modules/bin/bin.module';
import { StockModule } from '../modules/stock/stock.module';

@Module({
  imports: [
    ProductsModule,
    ConsuleModule,
    WarehouseModule,
    ZoneModule,
    RackModule,
    BinModule,
    StockModule,
  ],
  controllers: [AppController, HealthController],
  providers: [AppService],
})
export class AppModule {}
