import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PaymentprocessorModule } from '../modules/PaymentProcessor/paymentprocessor.module';
import { WalletModule } from '../modules/wallet/wallet.module';
import { TransactionModule } from '../modules/transaction/transaction.module';
import { HealthController } from '../health/health.controller';

@Module({
  imports: [PaymentprocessorModule, WalletModule, TransactionModule],
  controllers: [AppController, HealthController],
  providers: [AppService],
})
export class AppModule {}
