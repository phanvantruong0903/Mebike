import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { lastValueFrom, Observable } from 'rxjs';
import {
  CreateWithDrawInput,
  GRPC_PACKAGE,
  GRPC_SERVICES,
  TransactionListResponse,
  TransactionResponse,
  UpdateWithDrawStatusInput,
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
    search?: string;
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

  async getTransactionDetail(data: { id: string }) {
    return await lastValueFrom(this.paymentService.GetTransaction(data));
  }

  async createWithdraw(data: CreateWithDrawInput, accountId: string) {
    return await lastValueFrom(
      this.paymentService.CreateWithdraw({
        ...data,
        accountId,
      }),
    );
  }

  async updateWithdrawStatus(data: UpdateWithDrawStatusInput) {
    return await lastValueFrom(this.paymentService.UpdateWithdrawStatus(data));
  }
}
