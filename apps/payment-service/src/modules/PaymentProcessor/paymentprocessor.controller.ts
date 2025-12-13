import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { PaymentprocessorService } from './paymentprocessor.service';
import {
  GRPC_SERVICES,
  grpcResponse,
  PAYMENT_MESSAGES,
  PAYMENT_METHODS,
  SERVER_MESSAGE,
  throwGrpcError,
} from '@mebike/common';

@Controller()
export class PaymentprocessorController {
  constructor(
    private readonly paymentprocessorService: PaymentprocessorService,
  ) {}

  @GrpcMethod(GRPC_SERVICES.PAYMENT, PAYMENT_METHODS.CREATE_PAYMENT_URL)
  async createPaymentUrl(data: {
    amount: number;
    ipAddr: string;
    accountId: string;
  }): Promise<ReturnType<typeof grpcResponse>> {
    if (!data.amount) {
      throwGrpcError(400, SERVER_MESSAGE.BAD_REQUEST, [
        PAYMENT_MESSAGES.AMOUNT_REQUIRED,
      ]);
    }
    if (!data.ipAddr) {
      throwGrpcError(400, SERVER_MESSAGE.BAD_REQUEST, [
        PAYMENT_MESSAGES.IP_ADDR_REQUIRED,
      ]);
    }

    const paymentUrl = await this.paymentprocessorService.createPaymentUrl(
      data,
    );
    return grpcResponse({ paymentUrl }, PAYMENT_MESSAGES.CREATE_SUCCESS);
  }

  @GrpcMethod(GRPC_SERVICES.PAYMENT, PAYMENT_METHODS.PAYMENT_CALLBACK)
  async paymentCallback(data: {
    accountId: string;
    amount: number;
  }): Promise<ReturnType<typeof grpcResponse>> {
    const response = await this.paymentprocessorService.DepositCallback(
      data.accountId,
      Number(data.amount),
    );
    return grpcResponse(response, PAYMENT_MESSAGES.DEPOSIT_SUCCESS);
  }

  @GrpcMethod(GRPC_SERVICES.PAYMENT, PAYMENT_METHODS.CREATE_WALLET)
  async createWallet(data: {
    accountId: string;
  }): Promise<ReturnType<typeof grpcResponse>> {
    const response = await this.paymentprocessorService.createWallet(
      data.accountId,
    );
    return grpcResponse(response, PAYMENT_MESSAGES.DEPOSIT_SUCCESS);
  }
}
