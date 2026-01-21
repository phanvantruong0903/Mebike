import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { Observable, firstValueFrom } from 'rxjs';
import {
  GRPC_PACKAGE,
  GetBikeInput,
  CreateBikeInput,
  BikeResponse,
  BikeListResponse,
  BikeStatus,
  Bike,
  GRPC_SERVICES,
  meiliClient,
  BikeResult,
  UpdateBikeDto,
} from '@mebike/common';

interface BikeServiceClient {
  GetBike(data: { id: string }): Observable<BikeResponse>;
  UpdateBike(data: UpdateBikeDto): Observable<BikeResponse>;
  GetAllBikes(data: GetBikeInput): Observable<BikeListResponse>;
  CreateBike(data: CreateBikeInput): Observable<BikeResponse>;
  ChangeBikeStatus(data: {
    id: string;
    status: BikeStatus;
  }): Observable<BikeResponse>;
  GetBikesByIds(data: { ids: string[] }): Observable<{ data: Bike[] }>;
}

@Injectable()
export class BikeService implements OnModuleInit {
  private fleetService!: BikeServiceClient;

  constructor(
    @Inject(GRPC_PACKAGE.FLEET) private readonly client: ClientGrpc,
  ) {}

  async onModuleInit() {
    this.fleetService = this.client.getService<BikeServiceClient>(
      GRPC_SERVICES.FLEET,
    );
    await this.createBikeIndex();
    await meiliClient.index('Bike').updateSettings({
      searchableAttributes: ['chipId', 'id', 'supplier.name', 'station.name'],
      filterableAttributes: ['status', 'supplier.id', 'station.id'],
    });
  }

  async createBikeIndex() {
    try {
      await meiliClient.getIndex('Bike');
    } catch {
      await meiliClient.createIndex('Bike', { primaryKey: 'id' });
    }
  }

  async createBike(data: CreateBikeInput) {
    return await firstValueFrom(this.fleetService.CreateBike(data));
  }

  async updateBike(data: UpdateBikeDto) {
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

  async changeBikeStatus(data: { id: string; status: BikeStatus }) {
    return await firstValueFrom(this.fleetService.ChangeBikeStatus(data));
  }

  async getBikeByIds(ids: string[]): Promise<Bike[]> {
    const response = await firstValueFrom(
      this.fleetService.GetBikesByIds({ ids }),
    );
    return response.data || [];
  }

  async autoComplete(query: string): Promise<{ data: BikeResult[] }> {
    const result = await meiliClient.index('Bike').search(query, {
      limit: 10,
    });
    return {
      data: result.hits as BikeResult[],
    };
  }

  async searchBike(page: number, limit: number, query: string) {
    const result = await meiliClient.index('Bike').search(query, {
      limit,
      offset: (page - 1) * limit,
    });
    return {
      data: result.hits as BikeResult[],
      pagination: {
        total: result.estimatedTotalHits || 0,
        page,
        limit,
        totalPages: Math.ceil(result.estimatedTotalHits / limit),
      },
    };
  }
}
