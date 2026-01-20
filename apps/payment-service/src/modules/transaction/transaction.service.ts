import {
  BaseService,
  CreateWithDrawDto,
  GetAllWithdrawDto,
  PAYMENT_MESSAGES,
  PaymentMethod,
  Prisma,
  prismaPayment,
  SERVER_MESSAGE,
  throwGrpcError,
  TransactionModel,
  TransactionStatus,
  TransactionType,
  UpdateWithDrawStatusDto,
  WalletModel,
  WalletStatus,
  WithdrawModel,
  WithdrawStatus,
} from '@mebike/common';
import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

const VALID_WITHDRAW_TRANSITIONS: Record<WithdrawStatus, WithdrawStatus[]> = {
  [WithdrawStatus.PENDING]: [WithdrawStatus.APPROVED, WithdrawStatus.REJECTED],
  [WithdrawStatus.APPROVED]: [WithdrawStatus.COMPLETED],
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

  async createWithdrawTransaction(data: CreateWithDrawDto) {
    return await prismaPayment.$transaction(
      // @ts-expect-error - Prisma transaction callback type inference issue, tx parameter type is complex and verbose to annotate
      async (tx) => {
        const wallet = await tx.wallet.findUnique({
          where: {
            accountId: data.accountId,
          },
        });

        if (!wallet) {
          throwGrpcError(404, SERVER_MESSAGE.NOT_FOUND, [
            PAYMENT_MESSAGES.WALLET_NOT_FOUND,
          ]);
        }

        if (wallet.status !== WalletStatus.ACTIVE) {
          throwGrpcError(400, SERVER_MESSAGE.BAD_REQUEST, [
            PAYMENT_MESSAGES.WALLET_BLOCKED,
          ]);
        }

        if (wallet.balance.lessThan(data.amount)) {
          throwGrpcError(400, SERVER_MESSAGE.BAD_REQUEST, [
            PAYMENT_MESSAGES.NOT_ENOUGH_BALANCE,
          ]);
        }

        const transaction = await tx.withdraw.create({
          data: {
            accountId: data.accountId,
            amount: data.amount,
            bank: data.bank,
            accountOwner: data.accountOwner,
            accountNumber: data.accountNumber,
            note: data.note || '',
          },
        });
        return transaction;
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead,
      },
    );
  }

  async updateWithdrawTransactionStatus(data: UpdateWithDrawStatusDto) {
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

    if (data.status === WithdrawStatus.REJECTED && !data.reason) {
      throwGrpcError(400, SERVER_MESSAGE.BAD_REQUEST, [
        PAYMENT_MESSAGES.REASON_REQUIRED,
      ]);
    }

    const currentStatus = findWithdraw.status;
    const allowedNextStatus = VALID_WITHDRAW_TRANSITIONS[currentStatus];
    if (!allowedNextStatus.includes(data.status)) {
      throwGrpcError(400, SERVER_MESSAGE.BAD_REQUEST, [
        PAYMENT_MESSAGES.INVALID_STATUS,
      ]);
    }

    if (data.status === WithdrawStatus.COMPLETED) {
      return await this.completedWithdrawRequest(
        findWithdraw.accountId,
        findWithdraw,
        data.reason,
      );
    }

    const updatedWithdraw = await prismaPayment.withdraw.update({
      where: { id: data.id },
      data: {
        status: data.status,
        reason: data.reason,
      },
    });

    return updatedWithdraw;
  }

  async getWithdrawDetail(id: string) {
    return await prismaPayment.withdraw.findUnique({ where: { id } });
  }

  async getAllWithdraws(data: GetAllWithdrawDto) {
    const searchFilter = {
      ...(data.accountId && { accountId: data.accountId }),
    };

    const [response, total] = await Promise.all([
      prismaPayment.withdraw.findMany({
        where: searchFilter,
        skip: (data.page - 1) * data.limit,
        take: data.limit,
      }),
      prismaPayment.withdraw.count({
        where: searchFilter,
      }),
    ]);

    return {
      data: response,
      total,
      page: data.page,
      limit: data.limit,
      totalPages: Math.ceil(total / data.limit),
    };
  }

  async completedWithdrawRequest(
    accountId: string,
    findWithDraw: WithdrawModel,
    reason?: string,
  ) {
    const transactionId = uuidv4();

    try {
      return await prismaPayment.$transaction(
        // @ts-expect-error - Prisma transaction callback type inference issue, tx parameter type is complex and verbose to annotate
        async (tx) => {
          const findWallet = await tx.wallet.findUnique({
            where: { accountId: accountId },
          });

          if (!findWallet) {
            throwGrpcError(404, SERVER_MESSAGE.NOT_FOUND, [
              PAYMENT_MESSAGES.WALLET_NOT_FOUND,
            ]);
          }

          await this.checkWalletActive(findWallet);

          // Atomic update wallet
          const updatedWallet = await tx.wallet
            .update({
              where: {
                accountId: accountId,
                balance: { gte: findWithDraw.amount },
              },
              data: {
                balance: {
                  decrement: findWithDraw.amount,
                },
              },
            })
            .catch(() => {
              throwGrpcError(400, SERVER_MESSAGE.BAD_REQUEST, [
                PAYMENT_MESSAGES.NOT_ENOUGH_BALANCE,
              ]);
            });

          const balanceAfter = updatedWallet.balance;
          const balanceBefore = updatedWallet.balance.add(findWithDraw.amount);

          await tx.transaction.create({
            data: {
              id: transactionId,
              accountId: accountId,
              type: TransactionType.WITHDRAWAL,
              status: TransactionStatus.SUCCESS,
              amount: findWithDraw.amount,
              paymentMethod: PaymentMethod.BALANCE,
              description: `Withdrawal ${findWithDraw.amount}`,
            },
          });

          await tx.walletHistory.create({
            data: {
              walletId: updatedWallet.id,
              transactionId,
              type: TransactionType.WITHDRAWAL,
              amount: findWithDraw.amount,
              balanceBefore,
              balanceAfter,
            },
          });

          return tx.withdraw.update({
            where: { id: findWithDraw.id },
            data: {
              status: WithdrawStatus.COMPLETED,
              reason: reason,
            },
          });
        },
        {
          isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead,
        },
      );
    } catch (error: any) {
      try {
        await prismaPayment.transaction.create({
          data: {
            id: transactionId,
            accountId: findWithDraw.accountId,
            type: TransactionType.WITHDRAWAL,
            amount: findWithDraw.amount,
            paymentMethod: PaymentMethod.BALANCE,
            description: `Failed withdrawal ${findWithDraw.amount} with error ${error.message}`,
            status: TransactionStatus.FAILED,
          },
        });
      } catch (logError) {
        console.error('Failed to log failed transaction:', logError);
      }

      throwGrpcError(500, SERVER_MESSAGE.INTERNAL_SERVER, [
        SERVER_MESSAGE.INTERNAL_SERVER,
      ]);
    }
  }

  async findUserWallet(accountId: string) {
    return await prismaPayment.wallet.findUnique({
      where: { accountId: accountId },
    });
  }

  async checkWalletActive(wallet: WalletModel) {
    if (!wallet) {
      throwGrpcError(404, SERVER_MESSAGE.NOT_FOUND, [
        PAYMENT_MESSAGES.WALLET_NOT_FOUND,
      ]);
    }

    if (wallet.status !== WalletStatus.ACTIVE) {
      throwGrpcError(400, SERVER_MESSAGE.BAD_REQUEST, [
        PAYMENT_MESSAGES.WALLET_BLOCKED,
      ]);
    }

    return true;
  }
}
