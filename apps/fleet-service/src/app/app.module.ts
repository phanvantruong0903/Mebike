import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SupplierModule } from '../modules/supplier/supplier.module';

@Module({
  imports: [SupplierModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
