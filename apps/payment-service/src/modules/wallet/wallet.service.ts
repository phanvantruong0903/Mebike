import { Injectable } from '@nestjs/common';
import { prismaPayment, WalletModel, WalletStatus } from '@mebike/common';

@Injectable()
export class WalletService {
  async createWallet(accountId: string): Promise<WalletModel> {
    const result = await prismaPayment.wallet.create({
      data: {
        accountId: accountId,
        balance: 0,
        status: WalletStatus.ACTIVE,
      },
    });
    return result;
  }
}
