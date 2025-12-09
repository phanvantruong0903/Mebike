import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SupplierModule } from '../modules/supplier/supplier.module';
import { StationModule } from '../modules/station/station.module';

@Module({
  imports: [SupplierModule, StationModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
