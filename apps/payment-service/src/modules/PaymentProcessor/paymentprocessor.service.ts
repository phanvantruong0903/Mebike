import { Injectable } from '@nestjs/common';
import moment from 'moment';
import crypto from 'node:crypto';
import querystring from 'qs';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import {
  DebitRentalDto,
  PAYMENT_MESSAGES,
  PaymentMethod,
  prismaPayment,
  SERVER_MESSAGE,
  throwGrpcError,
  TransactionStatus,
  TransactionType,
  WalletModel,
  WalletStatus,
} from '@mebike/common';

interface PaymentData {
  amount: number;
  bankCode?: string;
  language?: string;
  orderType?: string;
  ipAddr: string;
  accountId: string;
}

interface VnpParams {
  [key: string]: string | number;
}

function sortObject(obj: VnpParams): VnpParams {
  const sorted: VnpParams = {};
  const str = Object.keys(obj).sort();
  for (const key of str) {
    if (obj[key] !== undefined && obj[key] !== null && obj[key] !== '') {
      sorted[key] = encodeURIComponent(String(obj[key])).replace(/%20/g, '+');
    }
  }
  return sorted;
}

@Injectable()
export class PaymentprocessorService {
  private readonly tmnCode: string;
  private readonly secretKey: string;
  private readonly vnpUrl: string;
  private readonly returnUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.tmnCode = this.configService.get<string>('VNPAY_TMN_CODE') || '';
    this.secretKey = this.configService.get<string>('VNPAY_HASHSECRET') || '';
    this.vnpUrl = this.configService.get<string>('VNP_URL') || '';
    this.returnUrl = this.configService.get<string>('VNP_RETURNURL') || '';
  }

  async createPaymentUrl(data: PaymentData): Promise<string> {
    const date = new Date();
    const createDate = moment(date).format('YYYYMMDDHHmmss');
    const orderId =
      uuidv4().replace(/-/g, '').substring(0, 15) +
      moment(date).format('HHmmss');

    const tmnCode = this.tmnCode;
    const secretKey = this.secretKey;
    const vnpUrl = this.vnpUrl;
    const returnUrl = this.returnUrl;

    const {
      amount,
      bankCode,
      language = 'vn',
      orderType = 'other',
      ipAddr,
      accountId,
    } = data;

    const orderInfo = `Nạp tiền cho tài khoản ${accountId}`;

    const vnp_Params: VnpParams = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: tmnCode,
      vnp_Locale: language,
      vnp_CurrCode: 'VND',
      vnp_TxnRef: orderId,
      vnp_OrderInfo: orderInfo,
      vnp_OrderType: orderType,
      vnp_Amount: amount * 100,
      vnp_ReturnUrl: returnUrl,
      vnp_CreateDate: createDate,
      vnp_IpAddr: ipAddr,
    };

    if (bankCode) vnp_Params['vnp_BankCode'] = bankCode;

    const sortedParams = sortObject(vnp_Params);
    const signData = querystring.stringify(sortedParams, { encode: false });
    const hmac = crypto.createHmac('sha512', secretKey);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    const finalParams = {
      ...sortedParams,
      vnp_SecureHash: signed,
    };

    return vnpUrl + '?' + querystring.stringify(finalParams, { encode: false });
  }

  async DepositCallback(
    accountId: string,
    amount: number,
    description: string,
  ) {
    const transactionId = uuidv4();

    try {
      const findWallet = await this.checkWalletExist(accountId);
      const newAmount = findWallet.balance.add(amount);

      await prismaPayment.$transaction([
        prismaPayment.wallet.update({
          where: { accountId },
          data: { balance: newAmount },
        }),
        prismaPayment.walletHistory.create({
          data: {
            walletId: findWallet.id,
            transactionId,
            type: TransactionType.TOPUP,
            amount,
            balanceBefore: findWallet.balance,
            balanceAfter: newAmount,
          },
        }),
        prismaPayment.transaction.create({
          data: {
            id: transactionId,
            accountId,
            type: TransactionType.TOPUP,
            amount,
            paymentMethod: PaymentMethod.VNPAY,
            description,
            status: TransactionStatus.SUCCESS,
          },
        }),
      ]);
    } catch (error) {
      await prismaPayment.transaction.create({
        data: {
          id: transactionId,
          accountId,
          type: TransactionType.TOPUP,
          amount,
          paymentMethod: PaymentMethod.VNPAY,
          description: `FAILED: ${description} - Error: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`,
          status: TransactionStatus.FAILED,
        },
      });

      throwGrpcError(500, SERVER_MESSAGE.INTERNAL_SERVER, [
        SERVER_MESSAGE.INTERNAL_SERVER,
      ]);
    }
  }

  async createWallet(accountId: string): Promise<WalletModel> {
    const findWallet = await this.checkWalletExist(accountId);
    if (findWallet) {
      throwGrpcError(400, SERVER_MESSAGE.BAD_REQUEST, [
        PAYMENT_MESSAGES.WALLET_EXISTED,
      ]);
    }

    const result = await prismaPayment.wallet.create({
      data: {
        accountId: accountId,
        balance: 0,
        status: WalletStatus.ACTIVE,
      },
    });
    return result;
  }

  async debit(data: DebitRentalDto) {
    this.validateData(
      data.accountId,
      data.amount,
      data.description,
      data.transactionType,
    );
    const wallet = await this.checkWalletExist(data.accountId);
    const newAmount = wallet.balance.sub(data.amount);
    if (newAmount.lt(0)) {
      throwGrpcError(400, SERVER_MESSAGE.BAD_REQUEST, [
        PAYMENT_MESSAGES.NOT_ENOUGH_BALANCE,
      ]);
    }

    const transactionId = uuidv4();

    try {
      await prismaPayment.$transaction(
        [
          prismaPayment.wallet.update({
            where: {
              accountId: data.accountId,
            },
            data: {
              balance: newAmount,
            },
          }),
          prismaPayment.walletHistory.create({
            data: {
              walletId: wallet.id,
              transactionId,
              type: data.transactionType,
              amount: data.amount,
              balanceBefore: wallet.balance,
              balanceAfter: newAmount,
            },
          }),
          prismaPayment.transaction.create({
            data: {
              id: transactionId,
              accountId: data.accountId,
              type: data.transactionType,
              amount: data.amount,
              paymentMethod: PaymentMethod.BALANCE,
              status: TransactionStatus.SUCCESS,
              description: data.description || 'Debit for rental service',
            },
          }),
        ],
        {
          isolationLevel: 'Serializable',
        },
      );
    } catch (error) {
      await prismaPayment.transaction.create({
        data: {
          id: transactionId,
          accountId: data.accountId,
          type: data.transactionType,
          amount: data.amount,
          paymentMethod: PaymentMethod.BALANCE,
          description: `FAILED: ${
            data.description || 'Debit for rental service'
          } - Error: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`,
          status: TransactionStatus.FAILED,
        },
      });

      throwGrpcError(500, SERVER_MESSAGE.INTERNAL_SERVER, [
        SERVER_MESSAGE.INTERNAL_SERVER,
      ]);
    }
  }

  async checkWalletExist(accountId: string): Promise<WalletModel> {
    const findWallet = await prismaPayment.wallet.findUnique({
      where: {
        accountId,
      },
    });
    if (!findWallet) {
      throwGrpcError(400, SERVER_MESSAGE.BAD_REQUEST, [
        PAYMENT_MESSAGES.WALLET_NOT_FOUND,
      ]);
    }

    if (findWallet.status === WalletStatus.BLOCKED) {
      throwGrpcError(400, SERVER_MESSAGE.BAD_REQUEST, [
        PAYMENT_MESSAGES.WALLET_BLOCKED,
      ]);
    }
    return findWallet;
  }

  private async validateData(
    accountId: string,
    amount: number,
    description?: string,
    transactionType?: TransactionType,
  ) {
    if (!accountId) {
      throwGrpcError(400, SERVER_MESSAGE.BAD_REQUEST, [
        PAYMENT_MESSAGES.ACCOUNT_ID_REQUIRED,
      ]);
    }
    if (!amount) {
      throwGrpcError(400, SERVER_MESSAGE.BAD_REQUEST, [
        PAYMENT_MESSAGES.AMOUNT_REQUIRED,
      ]);
    }
    if (amount < 0) {
      throwGrpcError(400, SERVER_MESSAGE.BAD_REQUEST, [
        PAYMENT_MESSAGES.AMOUNT_MUST_BE_POSITIVE,
      ]);
    }
    if (description !== undefined && description !== null) {
      if (typeof description === 'string' && description.trim().length === 0) {
        throwGrpcError(400, SERVER_MESSAGE.BAD_REQUEST, [
          PAYMENT_MESSAGES.DESCRIPTION_REQUIRED,
        ]);
      }
    }
    if (transactionType !== undefined && transactionType !== null) {
      if (
        typeof transactionType === 'string' &&
        transactionType.trim().length === 0
      ) {
        throwGrpcError(400, SERVER_MESSAGE.BAD_REQUEST, [
          PAYMENT_MESSAGES.TRANSACTION_TYPE_REQUIRED,
        ]);
      }
    }
  }
}
