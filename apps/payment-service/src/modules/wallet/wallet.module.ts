import { Module } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { WalletController } from './wallet.controller';

@Module({
  imports: [],
  controllers: [WalletController],
  providers: [WalletService],
})
export class WalletModule {}
