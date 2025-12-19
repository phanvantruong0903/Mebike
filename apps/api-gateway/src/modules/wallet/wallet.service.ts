import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { Observable, firstValueFrom } from 'rxjs';
import { GRPC_PACKAGE, GRPC_SERVICES } from '@mebike/common';

interface WalletServiceClient {
  CreateWallet(data: { accountId: string }): Observable<any>;
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

  async createWallet(data: { accountId: string }) {
    return await firstValueFrom(this.paymentService.CreateWallet(data));
  }
}
