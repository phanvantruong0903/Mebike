import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SupplierModule } from '../modules/supplier/supplier.module';
import { StationModule } from '../modules/station/station.module';
import { BikeModule } from '../modules/bike/bike.module';
import { HealthController } from '../health/health.controller';

@Module({
  imports: [SupplierModule, StationModule, BikeModule],
  controllers: [AppController, HealthController],
  providers: [AppService],
})
export class AppModule {}
