import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PaymentprocessorModule } from '../modules/PaymentProcessor/paymentprocessor.module';
import { WalletModule } from '../modules/wallet/wallet.module';

@Module({
  imports: [PaymentprocessorModule, WalletModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
