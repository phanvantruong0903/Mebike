import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { Observable, firstValueFrom } from 'rxjs';
import {
  GRPC_PACKAGE,
  GRPC_SERVICES,
  RentalResponse,
  RentalListResponse,
  CreateRentalInput,
  GetRentalInput,
  GetRentalListInput,
  EndRentalInput,
} from '@mebike/common';

interface RentalServiceClient {
  CreateRental(
    data: CreateRentalInput & { accountId: string },
  ): Observable<RentalResponse>;
  EndRental(
    data: EndRentalInput & { accountId: string },
  ): Observable<RentalResponse>;
  GetRental(data: GetRentalInput): Observable<RentalResponse>;
  GetRentalList(data: GetRentalListInput): Observable<RentalListResponse>;
}

@Injectable()
export class RentalService implements OnModuleInit {
  private rentalService!: RentalServiceClient;

  constructor(
    @Inject(GRPC_PACKAGE.RENTAL) private readonly client: ClientGrpc,
  ) {}

  onModuleInit() {
    this.rentalService = this.client.getService<RentalServiceClient>(
      GRPC_SERVICES.RENTAL,
    );
  }

  async createRental(data: CreateRentalInput & { accountId: string }) {
    return await firstValueFrom(this.rentalService.CreateRental(data));
  }

  async endRental(data: EndRentalInput & { accountId: string }) {
    return await firstValueFrom(this.rentalService.EndRental(data));
  }

  async getRentalList(data: GetRentalListInput) {
    const response = await firstValueFrom(
      this.rentalService.GetRentalList(data),
    );
    return {
      ...response,
      data: response.data ?? [],
    };
  }

  async getRental(data: { id: string }) {
    return await firstValueFrom(this.rentalService.GetRental(data));
  }
}
