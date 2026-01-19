import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { lastValueFrom, Observable } from 'rxjs';
import { GraphQLError } from 'graphql';
import {
  CreateWithDrawDto,
  CreateWithDrawInput,
  GRPC_PACKAGE,
  GRPC_SERVICES,
  PAYMENT_MESSAGES,
  Role,
  TransactionListResponse,
  TransactionModel,
  TransactionResponse,
  UpdateWithDrawStatusInput,
  UserProfile,
  WithdrawListResponse,
  WithdrawModel,
  WithdrawResponse,
} from '@mebike/common';

interface PaymentServiceClient {
  GetAllTransactions(data: {
    page: number;
    limit: number;
    search?: string;
    accountId?: string;
  }): Observable<TransactionListResponse>;
  GetTransaction(data: { id: string }): Observable<TransactionResponse>;
  CreateWithdraw(data: {
    accountId: string;
    bank: string;
    accountOwner: string;
    accountNumber: string;
    amount: number;
    note?: string;
  }): Observable<WithdrawResponse>;
  UpdateWithdrawStatus(
    data: UpdateWithDrawStatusInput,
  ): Observable<WithdrawResponse>;
  GetAllWithdraws(data: {
    page: number;
    limit: number;
    search?: string;
    accountId?: string;
  }): Observable<WithdrawListResponse>;
  GetWithdraw(data: { id: string }): Observable<WithdrawResponse>;
}

@Injectable()
export class TransactionService implements OnModuleInit {
  private paymentService!: PaymentServiceClient;

  constructor(
    @Inject(GRPC_PACKAGE.PAYMENT) private readonly client: ClientGrpc,
  ) {}

  onModuleInit() {
    this.paymentService = this.client.getService<PaymentServiceClient>(
      GRPC_SERVICES.PAYMENT,
    );
  }

  async getAllTransaction(data: {
    page: number;
    limit: number;
    accountId?: string;
  }) {
    const response = await lastValueFrom(
      this.paymentService.GetAllTransactions(data),
    );
    return {
      ...response,
      data: response.data ?? [],
    };
  }

  async getTransactionDetail(data: { id: string }, user: UserProfile) {
    const response = await lastValueFrom(
      this.paymentService.GetTransaction(data),
    );

    const transaction = response.data as unknown as TransactionModel;

    if (user.role !== Role.ADMIN && transaction?.accountId !== user.accountId) {
      throw new GraphQLError(PAYMENT_MESSAGES.FORBIDDEN, {
        extensions: {
          statusCode: 403,
        },
      });
    }

    return response;
  }

  async createWithdraw(data: CreateWithDrawDto) {
    return await lastValueFrom(
      this.paymentService.CreateWithdraw({
        ...data,
        accountId: data.accountId,
      }),
    );
  }

  async getAllWithdraw(data: {
    page: number;
    limit: number;
    search?: string;
    accountId?: string;
  }) {
    const response = await lastValueFrom(
      this.paymentService.GetAllWithdraws(data),
    );
    return {
      ...response,
      data: response.data ?? [],
    };
  }

  async updateWithdrawStatus(data: UpdateWithDrawStatusInput) {
    return await lastValueFrom(this.paymentService.UpdateWithdrawStatus(data));
  }

  async getWithdrawDetail(id: string, user: UserProfile) {
    const response = await lastValueFrom(
      this.paymentService.GetWithdraw({ id }),
    );

    const withdraw = response.data as unknown as WithdrawModel;
    if (user.role !== Role.ADMIN && withdraw?.accountId !== user.accountId) {
      throw new GraphQLError(PAYMENT_MESSAGES.FORBIDDEN, {
        extensions: {
          statusCode: 403,
        },
      });
    }
    return response;
  }
}
