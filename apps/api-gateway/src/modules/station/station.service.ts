import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { Observable, firstValueFrom } from 'rxjs';
import {
  GRPC_PACKAGE,
  GRPC_SERVICES,
  UpdateSupplierInput,
  CreateStationInput,
  GetStationInput,
  StationResponse,
  StationListResponse,
} from '@mebike/common';

interface StationServiceClient {
  GetStation(data: { id: string }): Observable<StationResponse>;
  UpdateStation(
    data: UpdateSupplierInput & { id: string },
  ): Observable<StationResponse>;
  GetAllStations(data: GetStationInput): Observable<StationListResponse>;
  CreateStation(data: CreateStationInput): Observable<StationResponse>;
}

@Injectable()
export class StationService implements OnModuleInit {
  private fleetService!: StationServiceClient;

  constructor(
    @Inject(GRPC_PACKAGE.FLEET) private readonly client: ClientGrpc,
  ) {}

  onModuleInit() {
    this.fleetService = this.client.getService<StationServiceClient>(
      GRPC_SERVICES.FLEET,
    );
  }

  async createStation(data: CreateStationInput) {
    return await firstValueFrom(this.fleetService.CreateStation(data));
  }

  async updateStation(data: UpdateSupplierInput & { id: string }) {
    return await firstValueFrom(this.fleetService.UpdateStation(data));
  }

  async getAllStation(data: GetStationInput) {
    const response = await firstValueFrom(
      this.fleetService.GetAllStations(data),
    );
    return {
      ...response,
      data: response.data ?? [],
    };
  }

  async getStation(data: { id: string }) {
    return await firstValueFrom(this.fleetService.GetStation(data));
  }
}
