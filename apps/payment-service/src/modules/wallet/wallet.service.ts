import { Injectable } from '@nestjs/common';
import {
  BaseService,
  ChangeWalletStatusDto,
  PAYMENT_MESSAGES,
  prismaPayment,
  SERVER_MESSAGE,
  throwGrpcError,
  WalletModel,
  WalletStatus,
} from '@mebike/common';

@Injectable()
export class WalletService extends BaseService<
  WalletModel,
  never,
  ChangeWalletStatusDto
> {
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

  async getWallet(accountId: string): Promise<WalletModel> {
    try {
      const result = await prismaPayment.wallet.findUnique({
        where: {
          accountId: accountId,
        },
      });
      if (!result) {
        throwGrpcError(404, SERVER_MESSAGE.NOT_FOUND, [
          PAYMENT_MESSAGES.WALLET_NOT_FOUND,
        ]);
      }
      return result;
    } catch (error: any) {
      if (error?.code === 'P2003') {
        const field = error.meta?.field_name ?? 'relation';
        throwGrpcError(400, SERVER_MESSAGE.FOREIGN_KEY_FAILED, [
          SERVER_MESSAGE.FOREIGN_KEY_INVALID(field),
        ]);
      }

      if (error?.code === 'P2025') {
        throwGrpcError(404, SERVER_MESSAGE.NOT_FOUND, [
          SERVER_MESSAGE.NOT_FOUND,
        ]);
      }

      throwGrpcError(500, SERVER_MESSAGE.DATABASE_ERROR, [
        error.message ?? SERVER_MESSAGE.UNEXPECTED_ERROR,
      ]);
    }
  }

  async updateWalletStatus(data: ChangeWalletStatusDto): Promise<WalletModel> {
    const result = await prismaPayment.wallet.update({
      where: {
        id: data.id,
      },
      data: {
        status: data.status,
      },
    });
    return result;
  }
}
