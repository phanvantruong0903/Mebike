import { Controller, UsePipes, ValidationPipe } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { GrpcMethod } from '@nestjs/microservices';
import {
  BaseGrpcHandler,
  CreateWithDrawDto,
  GetAllWithdrawDto,
  GetTransactionDto,
  GRPC_SERVICES,
  grpcPaginateResponse,
  grpcResponse,
  PAYMENT_MESSAGES,
  TRANSACTION_METHODS,
  TransactionModel,
  UpdateWithDrawStatusDto,
} from '@mebike/common';

@Controller()
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class TransactionController {
  private readonly baseGrpcHandler: BaseGrpcHandler<
    TransactionModel,
    never,
    never
  >;

  constructor(private readonly transactionService: TransactionService) {
    this.baseGrpcHandler = new BaseGrpcHandler(this.transactionService);
  }

  @GrpcMethod(GRPC_SERVICES.PAYMENT, TRANSACTION_METHODS.GET_ALL)
  async getAllTransaction(
    data: GetTransactionDto,
  ): Promise<ReturnType<typeof grpcPaginateResponse>> {
    const filter = {
      ...(data.accountId && { accountId: data.accountId }),
    };

    const result = await this.baseGrpcHandler.getAllLogic(
      data.page,
      data.limit,
      filter,
    );
    return grpcPaginateResponse(result, PAYMENT_MESSAGES.GET_ALL_SUCCESS);
  }

  @GrpcMethod(GRPC_SERVICES.PAYMENT, TRANSACTION_METHODS.GET_ONE)
  async getTransactionDetail({
    id,
  }: {
    id: string;
  }): Promise<ReturnType<typeof grpcResponse>> {
    const result = await this.baseGrpcHandler.getOneById(id);
    return grpcResponse<TransactionModel>(
      result as unknown as TransactionModel,
      PAYMENT_MESSAGES.GET_ONE,
    );
  }

  @GrpcMethod(GRPC_SERVICES.PAYMENT, TRANSACTION_METHODS.CREATE_WITHDRAW)
  async createWithdrawTransaction(
    data: CreateWithDrawDto,
  ): Promise<ReturnType<typeof grpcResponse>> {
    const result = await this.transactionService.createWithdrawTransaction(
      data,
    );
    return grpcResponse<TransactionModel>(
      result as unknown as TransactionModel,
      PAYMENT_MESSAGES.CREATE_WITHDRAW_SUCCESS,
    );
  }

  @GrpcMethod(GRPC_SERVICES.PAYMENT, TRANSACTION_METHODS.UPDATE_WITHDRAW_STATUS)
  async updateWithdrawTransactionStatus(
    data: UpdateWithDrawStatusDto,
  ): Promise<ReturnType<typeof grpcResponse>> {
    const result =
      await this.transactionService.updateWithdrawTransactionStatus(data);
    return grpcResponse<TransactionModel>(
      result as unknown as TransactionModel,
      PAYMENT_MESSAGES.UPDATE_WITHDRAW_SUCCESS,
    );
  }

  @GrpcMethod(GRPC_SERVICES.PAYMENT, TRANSACTION_METHODS.GET_ALL_WITHDRAW)
  async getAllWithdraw(
    data: GetAllWithdrawDto,
  ): Promise<ReturnType<typeof grpcPaginateResponse>> {
    const result = await this.transactionService.getAllWithdraws(data);
    return grpcPaginateResponse(
      result,
      PAYMENT_MESSAGES.GET_ALL_WITHDRAW_SUCCESS,
    );
  }

  @GrpcMethod(GRPC_SERVICES.PAYMENT, TRANSACTION_METHODS.GET_ONE_WITHDRAW)
  async getWithdrawDetail({ id }: { id: string }) {
    const withdraw = await this.transactionService.getWithdrawDetail(id);
    return grpcResponse(withdraw, PAYMENT_MESSAGES.GET_ONE_WITHDRAW_SUCCESS);
  }
}
