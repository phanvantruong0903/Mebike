import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { Observable, firstValueFrom } from 'rxjs';
import {
  GetWalletInput,
  GRPC_PACKAGE,
  GRPC_SERVICES,
  UpdateWalletStatusInput,
} from '@mebike/common';

interface WalletServiceClient {
  ChangeWalletStatus(data: UpdateWalletStatusInput): Observable<any>;
  GetAllWallet(data: GetWalletInput): Observable<any>;
  GetWallet(data: { accountId: string }): Observable<any>;
}

@Injectable()
export class WalletService implements OnModuleInit {
  private paymentService!: WalletServiceClient;

  constructor(
    @Inject(GRPC_PACKAGE.PAYMENT) private readonly client: ClientGrpc,
  ) {}

  onModuleInit() {
    this.paymentService = this.client.getService<WalletServiceClient>(
      GRPC_SERVICES.PAYMENT,
    );
  }

  async changeWalletStatus(data: UpdateWalletStatusInput) {
    return await firstValueFrom(this.paymentService.ChangeWalletStatus(data));
  }

  async getAllWallet(data: GetWalletInput) {
    return await firstValueFrom(this.paymentService.GetAllWallet(data));
  }

  async getWallet(data: { accountId: string }) {
    return await firstValueFrom(this.paymentService.GetWallet(data));
  }
}
