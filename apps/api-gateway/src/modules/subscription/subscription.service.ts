import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { Observable, firstValueFrom } from 'rxjs';
import {
  GRPC_PACKAGE,
  GRPC_SERVICES,
  SubscriptionResponse,
  SubscriptionListResponse,
  CreateSubscriptionInput,
  GetSubscriptionListInput,
} from '@mebike/common';

interface SubscriptionServiceClient {
  CreateSubscription(
    data: CreateSubscriptionInput,
  ): Observable<SubscriptionResponse>;
  GetSubscription(data: { id: string }): Observable<SubscriptionResponse>;
  GetSubscriptionList(
    data: GetSubscriptionListInput,
  ): Observable<SubscriptionListResponse>;
  ActivateSubscription(data: { id: string }): Observable<SubscriptionResponse>;
  ExpireSubscription(data: { id: string }): Observable<SubscriptionResponse>;
}

@Injectable()
export class SubscriptionService implements OnModuleInit {
  private subscriptionService!: SubscriptionServiceClient;

  constructor(
    @Inject(GRPC_PACKAGE.MEMBERSHIP) private readonly client: ClientGrpc,
  ) {}

  onModuleInit() {
    this.subscriptionService =
      this.client.getService<SubscriptionServiceClient>(
        GRPC_SERVICES.MEMBERSHIP,
      );
  }

  async createSubscription(data: CreateSubscriptionInput) {
    return await firstValueFrom(
      this.subscriptionService.CreateSubscription(data),
    );
  }

  async activateSubscription(id: string) {
    return await firstValueFrom(
      this.subscriptionService.ActivateSubscription({ id }),
    );
  }

  async expireSubscription(id: string) {
    return await firstValueFrom(
      this.subscriptionService.ExpireSubscription({ id }),
    );
  }

  async getSubscriptionList(data: GetSubscriptionListInput) {
    const response = await firstValueFrom(
      this.subscriptionService.GetSubscriptionList(data),
    );
    return {
      ...response,
      data: response.data ?? [],
    };
  }

  async getSubscription(id: string) {
    return await firstValueFrom(
      this.subscriptionService.GetSubscription({ id }),
    );
  }
}
