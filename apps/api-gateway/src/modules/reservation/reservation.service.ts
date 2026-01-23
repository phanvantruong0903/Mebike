import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { Observable, firstValueFrom } from 'rxjs';
import {
  GRPC_PACKAGE,
  GRPC_SERVICES,
  CreateReservationInput,
  ActivateReservationInput,
  GetReservationListInput,
  ReservationResponse,
  ReservationListResponse,
} from '@mebike/common';

interface ReservationServiceClient {
  CreateReservation(
    data: CreateReservationInput & { accountId: string },
  ): Observable<ReservationResponse>;
  ActivateReservation(
    data: ActivateReservationInput & { accountId: string },
  ): Observable<ReservationResponse>;
  GetReservation(data: { id: string }): Observable<ReservationResponse>;
  GetReservationList(
    data: GetReservationListInput,
  ): Observable<ReservationListResponse>;
}

@Injectable()
export class ReservationService implements OnModuleInit {
  private reservationService!: ReservationServiceClient;

  constructor(
    @Inject(GRPC_PACKAGE.RESERVATION) private readonly client: ClientGrpc,
  ) {}

  onModuleInit() {
    this.reservationService = this.client.getService<ReservationServiceClient>(
      GRPC_SERVICES.RENTAL,
    );
  }

  async createReservation(
    data: CreateReservationInput & { accountId: string },
  ) {
    return await firstValueFrom(
      this.reservationService.CreateReservation(data),
    );
  }

  async activateReservation(
    data: ActivateReservationInput & { accountId: string },
  ) {
    return await firstValueFrom(
      this.reservationService.ActivateReservation(data),
    );
  }

  async getReservationList(data: GetReservationListInput) {
    const response = await firstValueFrom(
      this.reservationService.GetReservationList(data),
    );
    return {
      ...response,
      data: response.data ?? [],
    };
  }

  async getReservation(data: { id: string }) {
    return await firstValueFrom(this.reservationService.GetReservation(data));
  }
}
