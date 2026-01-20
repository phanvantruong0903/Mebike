import { Controller, UsePipes, ValidationPipe } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { PaymentprocessorService } from './paymentprocessor.service';
import {
  DebitSubscriptionDto,
  GRPC_SERVICES,
  grpcResponse,
  PAYMENT_MESSAGES,
  PAYMENT_METHODS,
  CreatePaymentUrlDto,
  PaymentCallbackDto,
  CreateWalletDto,
} from '@mebike/common';

@Controller()
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class PaymentprocessorController {
  constructor(
    private readonly paymentprocessorService: PaymentprocessorService,
  ) {}

  @GrpcMethod(GRPC_SERVICES.PAYMENT, PAYMENT_METHODS.CREATE_PAYMENT_URL)
  async createPaymentUrl(
    data: CreatePaymentUrlDto,
  ): Promise<ReturnType<typeof grpcResponse>> {
    const paymentUrl = await this.paymentprocessorService.createPaymentUrl(
      data,
    );
    return grpcResponse({ paymentUrl }, PAYMENT_MESSAGES.CREATE_SUCCESS);
  }

  @GrpcMethod(GRPC_SERVICES.PAYMENT, PAYMENT_METHODS.PAYMENT_CALLBACK)
  async paymentCallback(
    data: PaymentCallbackDto,
  ): Promise<ReturnType<typeof grpcResponse>> {
    const response = await this.paymentprocessorService.DepositCallback(
      data.accountId,
      Number(data.amount),
      data.description,
    );
    return grpcResponse(response, PAYMENT_MESSAGES.DEPOSIT_SUCCESS);
  }

  @GrpcMethod(GRPC_SERVICES.PAYMENT, PAYMENT_METHODS.CREATE_WALLET)
  async createWallet(
    data: CreateWalletDto,
  ): Promise<ReturnType<typeof grpcResponse>> {
    const response = await this.paymentprocessorService.createWallet(
      data.accountId,
    );
    return grpcResponse(response, PAYMENT_MESSAGES.DEPOSIT_SUCCESS);
  }

  @GrpcMethod(GRPC_SERVICES.PAYMENT, PAYMENT_METHODS.DEBIT_SUBSCRIPTION)
  async debitSubscription(
    data: DebitSubscriptionDto,
  ): Promise<ReturnType<typeof grpcResponse>> {
    const response = await this.paymentprocessorService.debitForSubscription(
      data,
    );
    return grpcResponse(response, PAYMENT_MESSAGES.DEPOSIT_SUCCESS);
  }
}
