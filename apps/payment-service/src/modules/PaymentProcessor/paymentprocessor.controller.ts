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
}
