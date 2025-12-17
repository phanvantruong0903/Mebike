import { Controller, UsePipes, ValidationPipe } from '@nestjs/common';
import { EventPattern, GrpcMethod, Payload } from '@nestjs/microservices';
import {
  BaseGrpcHandler,
  buildSearchFilter,
  ChangeWalletStatusDto,
  GetAllWalletsDto,
  GRPC_SERVICES,
  grpcPaginateResponse,
  grpcResponse,
  KAFKA_TOPIC,
  PAYMENT_MESSAGES,
  PAYMENT_METHODS,
  WalletModel,
} from '@mebike/common';
import { WalletService } from './wallet.service';

@Controller()
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class WalletController {
  private readonly baseGrpcHandler: BaseGrpcHandler<
    WalletModel,
    never,
    ChangeWalletStatusDto
  >;
  constructor(private readonly walletService: WalletService) {
    this.baseGrpcHandler = new BaseGrpcHandler(
      this.walletService,
      undefined,
      ChangeWalletStatusDto,
    );
  }

  @EventPattern(KAFKA_TOPIC.WALLET_CREATED)
  async createWallet(
    @Payload() accountId: string,
  ): Promise<ReturnType<typeof grpcResponse>> {
    console.log(accountId);
    const response = await this.walletService.createWallet(accountId);
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
  async getAllWallets(
    data: GetAllWalletsDto,
  ): Promise<ReturnType<typeof grpcPaginateResponse>> {
    const searchFields = ['id', 'accountId'];
    const searchFilter = buildSearchFilter(data.search, searchFields);

    const response = await this.baseGrpcHandler.getAllLogic(
      data.page,
      data.limit,
      searchFilter,
    );
    return grpcPaginateResponse(
      response,
      PAYMENT_MESSAGES.GET_ALL_WALLET_SUCCESS,
    );
  }

  @GrpcMethod(GRPC_SERVICES.PAYMENT, PAYMENT_METHODS.CHANGE_WALLET_STATUS)
  async updateWalletStatus(
    data: ChangeWalletStatusDto,
  ): Promise<ReturnType<typeof grpcResponse>> {
    const response = await this.walletService.updateWalletStatus(data);
    return grpcResponse(response, PAYMENT_MESSAGES.CHANGE_STATUS_SUCCESS);
  }
}
