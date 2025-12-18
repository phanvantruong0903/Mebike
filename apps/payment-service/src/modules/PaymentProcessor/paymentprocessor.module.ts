import { Module } from '@nestjs/common';
import { PaymentprocessorService } from './paymentprocessor.service';
import { PaymentprocessorController } from './paymentprocessor.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
  controllers: [PaymentprocessorController],
  providers: [PaymentprocessorService],
})
export class PaymentprocessorModule {}
