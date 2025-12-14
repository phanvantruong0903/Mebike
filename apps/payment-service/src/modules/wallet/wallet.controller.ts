import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import {
  BaseGrpcHandler,
  ChangeWalletStatusDto,
  GRPC_SERVICES,
  grpcResponse,
  PAYMENT_MESSAGES,
  PAYMENT_METHODS,
  WalletModel,
} from '@mebike/common';
import { WalletService } from './wallet.service';

@Controller()
export class WalletController {
  private readonly baseGrpcHandler: BaseGrpcHandler<
    WalletModel,
    never,
    ChangeWalletStatusDto
  >;
  constructor(private readonly walletService: WalletService) {
    this.baseGrpcHandler = new BaseGrpcHandler(this.walletService);
  }

  @GrpcMethod(GRPC_SERVICES.PAYMENT, PAYMENT_METHODS.CREATE_WALLET)
  async createWallet(data: {
    accountId: string;
  }): Promise<ReturnType<typeof grpcResponse>> {
    const response = await this.walletService.createWallet(data.accountId);
    return grpcResponse(response, PAYMENT_MESSAGES.DEPOSIT_SUCCESS);
  }

  @GrpcMethod(GRPC_SERVICES.PAYMENT, PAYMENT_METHODS.GET_WALLET)
  async getWallet(data: {
    accountId: string;
  }): Promise<ReturnType<typeof grpcResponse>> {
    const response = await this.walletService.getWallet(data.accountId);
    return grpcResponse(response, PAYMENT_MESSAGES.GET_WALLET_SUCCESS);
  }

  @GrpcMethod(GRPC_SERVICES.PAYMENT, PAYMENT_METHODS.GET_ALL_WALLET)
  async getAllWallets(): Promise<ReturnType<typeof grpcResponse>> {
    const response = await this.baseGrpcHandler.getAllLogic();
    return grpcResponse(response, PAYMENT_MESSAGES.GET_ALL_WALLET_SUCCESS);
  }

  async updateWalletStatus(
    data: ChangeWalletStatusDto,
  ): Promise<ReturnType<typeof grpcResponse>> {
    const response = await this.walletService.updateWalletStatus(data);
    return grpcResponse(response, PAYMENT_MESSAGES.DEPOSIT_SUCCESS);
  }
}
