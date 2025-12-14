import {
  BaseService,
  CreateWithDrawDto,
  PAYMENT_MESSAGES,
  PaymentMethod,
  prismaPayment,
  SERVER_MESSAGE,
  throwGrpcError,
  TransactionModel,
  TransactionStatus,
  TransactionType,
  UpdateWithDrawStatusDto,
  WithdrawModel,
  WithdrawStatus,
} from '@mebike/common';
import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

const VALID_WITHDRAW_TRANSITIONS: Record<WithdrawStatus, WithdrawStatus[]> = {
  [WithdrawStatus.PENDING]: [WithdrawStatus.APPROVED, WithdrawStatus.REJECTED],
  [WithdrawStatus.APPROVED]: [
    WithdrawStatus.COMPLETED,
    WithdrawStatus.REJECTED,
  ],
  [WithdrawStatus.COMPLETED]: [],
  [WithdrawStatus.REJECTED]: [],
};

@Injectable()
export class TransactionService extends BaseService<
  TransactionModel,
  never,
  never
> {
  constructor() {
    super(prismaPayment.transaction);
  }

  async createWithdrawTransaction(
    data: CreateWithDrawDto,
  ): Promise<WithdrawModel> {
    const transaction = await prismaPayment.withdraw.create({
      data: {
        accountId: data.accountId,
        amount: data.amount,
        bank: data.bank,
        accountOwner: data.accountOwner,
        accountNumber: data.accountNumber,
        reason: data.reason || '',
        note: data.note || '',
      },
    });
    return transaction;
  }

  async updateWithdrawTransactionStatus(
    data: UpdateWithDrawStatusDto,
  ): Promise<WithdrawModel> {
    const findWithdraw = await prismaPayment.withdraw.findUnique({
      where: {
        id: data.id,
      },
    });
    if (!findWithdraw) {
      throwGrpcError(400, SERVER_MESSAGE.NOT_FOUND, [
        PAYMENT_MESSAGES.WITHDRAW_NOT_FOUND,
      ]);
    }

    const currentStatus = findWithdraw.status;
    const allowedNextStatus = VALID_WITHDRAW_TRANSITIONS[currentStatus];
    if (!allowedNextStatus.includes(data.status)) {
      throwGrpcError(400, SERVER_MESSAGE.BAD_REQUEST, [
        PAYMENT_MESSAGES.INVALID_STATUS,
      ]);
    }

    const transactionId = uuidv4();
    const [updatedWithdraw] = await Promise.all([
      prismaPayment.withdraw.update({
        where: {
          id: data.id,
        },
        data: {
          status: data.status,
          reason: data.reason,
        },
      }),
      prismaPayment.walletHistory.create({
        data: {
          walletId: findWithdraw.accountId,
          transactionId,
          type: TransactionType.WITHDRAWAL,
          amount: findWithdraw.amount,
          balanceBefore: findWithdraw.amount,
          balanceAfter: findWithdraw.amount,
        },
      }),
      prismaPayment.wallet.update({
        where: {
          accountId: findWithdraw.accountId,
        },
        data: {
          balance: {
            decrement: findWithdraw.amount,
          },
        },
      }),
      prismaPayment.transaction.create({
        data: {
          id: transactionId,
          accountId: findWithdraw.accountId,
          type: TransactionType.WITHDRAWAL,
          status: TransactionStatus.SUCCESS,
          amount: findWithdraw.amount,
          paymentMethod: PaymentMethod.BALANCE,
          description:
            findWithdraw.reason || `Withdrawal ${findWithdraw.amount}`,
        },
      }),
    ]);

    return updatedWithdraw;
  }
}
