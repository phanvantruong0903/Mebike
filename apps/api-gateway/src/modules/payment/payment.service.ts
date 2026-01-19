import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { Observable, firstValueFrom } from 'rxjs';
import {
  GRPC_PACKAGE,
  GRPC_SERVICES,
  CreatePaymentInput,
  PaymentResponse,
  CreatePaymentUrlDto,
} from '@mebike/common';

interface PaymentServiceClient {
  CreatePaymentUrl(data: CreatePaymentInput): Observable<PaymentResponse>;
  PaymentCallback(data: {
    accountId: string;
    amount: number;
    description: string;
  }): Observable<any>;
}

@Injectable()
export class PaymentService implements OnModuleInit {
  private paymentService!: PaymentServiceClient;

  constructor(
    @Inject(GRPC_PACKAGE.PAYMENT) private readonly client: ClientGrpc,
  ) {}

  onModuleInit() {
    this.paymentService = this.client.getService<PaymentServiceClient>(
      GRPC_SERVICES.PAYMENT,
    );
  }

  async createPayment(data: CreatePaymentUrlDto) {
    return await firstValueFrom(this.paymentService.CreatePaymentUrl(data));
  }

  async depositCallback(data: {
    accountId: string;
    amount: number;
    description: string;
  }) {
    return await firstValueFrom(this.paymentService.PaymentCallback(data));
  }
}
