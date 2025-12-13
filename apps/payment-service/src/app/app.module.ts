import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PaymentprocessorModule } from '../modules/PaymentProcessor/paymentprocessor.module';

@Module({
  imports: [PaymentprocessorModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
