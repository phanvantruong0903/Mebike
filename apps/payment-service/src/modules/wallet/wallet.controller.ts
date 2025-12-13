import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import {
  GRPC_SERVICES,
  grpcResponse,
  PAYMENT_MESSAGES,
  PAYMENT_METHODS,
} from '@mebike/common';
import { WalletService } from './wallet.service';

@Controller()
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @GrpcMethod(GRPC_SERVICES.PAYMENT, PAYMENT_METHODS.CREATE_WALLET)
  async createWallet(data: {
    accountId: string;
  }): Promise<ReturnType<typeof grpcResponse>> {
    const response = await this.walletService.createWallet(data.accountId);
    return grpcResponse(response, PAYMENT_MESSAGES.DEPOSIT_SUCCESS);
  }
}
