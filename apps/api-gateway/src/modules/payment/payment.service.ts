import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { Observable, firstValueFrom } from 'rxjs';
import {
  GRPC_PACKAGE,
  GRPC_SERVICES,
  CreatePaymentInput,
  PaymentResponse,
} from '@mebike/common';

interface PaymentServiceClient {
  CreatePaymentUrl(data: CreatePaymentInput): Observable<PaymentResponse>;
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

  async createPayment(data: CreatePaymentInput) {
    return await firstValueFrom(this.paymentService.CreatePaymentUrl(data));
  }
}
