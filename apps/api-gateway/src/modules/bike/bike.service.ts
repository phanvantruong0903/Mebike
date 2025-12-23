import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { Observable, firstValueFrom } from 'rxjs';
import {
  GRPC_PACKAGE,
  GRPC_SERVICES,
  UpdateBikeInput,
  GetBikeInput,
  CreateBikeInput,
  BikeResponse,
  BikeListResponse,
  Bike,
} from '@mebike/common';

interface BikeServiceClient {
  GetBike(data: { id: string }): Observable<BikeResponse>;
  UpdateBike(data: UpdateBikeInput & { id: string }): Observable<BikeResponse>;
  GetAllBikes(data: GetBikeInput): Observable<BikeListResponse>;
  CreateBike(data: CreateBikeInput): Observable<BikeResponse>;
  ChangeBikeStatus(data: {
    id: string;
    status: number;
  }): Observable<BikeResponse>;
  GetBikesByIds(data: { ids: string[] }): Observable<{ data: Bike[] }>;
}

@Injectable()
export class BikeService implements OnModuleInit {
  private fleetService!: BikeServiceClient;

  constructor(
    @Inject(GRPC_PACKAGE.FLEET) private readonly client: ClientGrpc,
  ) {}

  onModuleInit() {
    this.fleetService = this.client.getService<BikeServiceClient>(
      GRPC_SERVICES.FLEET,
    );
  }

  async createBike(data: CreateBikeInput) {
    return await firstValueFrom(this.fleetService.CreateBike(data));
  }

  async updateBike(data: UpdateBikeInput & { id: string }) {
    return await firstValueFrom(this.fleetService.UpdateBike(data));
  }

  async getAllBike(data: GetBikeInput) {
    const response = await firstValueFrom(this.fleetService.GetAllBikes(data));
    return {
      ...response,
      data: response.data ?? [],
    };
  }

  async getBike(data: { id: string }) {
    return await firstValueFrom(this.fleetService.GetBike(data));
  }

  async changeBikeStatus(data: { id: string; status: number }) {
    return await firstValueFrom(this.fleetService.ChangeBikeStatus(data));
  }

  async getBikeByIds(ids: string[]): Promise<Bike[]> {
    const response = await firstValueFrom(
      this.fleetService.GetBikesByIds({ ids }),
    );
    return response.data || [];
  }
}
