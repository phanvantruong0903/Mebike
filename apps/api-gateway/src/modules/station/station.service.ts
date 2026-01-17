import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { Observable, firstValueFrom } from 'rxjs';
import {
  GRPC_PACKAGE,
  GRPC_SERVICES,
  CreateStationInput,
  GetStationInput,
  StationResponse,
  StationListResponse,
  Station,
  UpdateStationInput,
  UpdateStationStatusInput,
  meiliClient,
  StationSearchPage,
  UserProfile,
  Role,
  StationSearchResult,
  StationStatus,
} from '@mebike/common';

interface StationServiceClient {
  GetStation(data: { id: string }): Observable<StationResponse>;
  UpdateStation(
    data: UpdateStationInput & { id: string },
  ): Observable<StationResponse>;
  GetAllStations(data: GetStationInput): Observable<StationListResponse>;
  CreateStation(data: CreateStationInput): Observable<StationResponse>;
  GetStationsByIds(data: { ids: string[] }): Observable<{ data: Station[] }>;
  UpdateStationStatus(
    data: UpdateStationStatusInput,
  ): Observable<StationResponse>;
}

@Injectable()
export class StationService implements OnModuleInit {
  private fleetService!: StationServiceClient;

  constructor(
    @Inject(GRPC_PACKAGE.FLEET) private readonly client: ClientGrpc,
  ) {}

  async onModuleInit() {
    this.fleetService = this.client.getService<StationServiceClient>(
      GRPC_SERVICES.FLEET,
    );
    await meiliClient.index('Station').updateSettings({
      searchableAttributes: ['name', 'address', 'id'],
      filterableAttributes: ['status'],
    });
  }

  async createStation(data: CreateStationInput) {
    return await firstValueFrom(this.fleetService.CreateStation(data));
  }

  async updateStation(id: string, data: UpdateStationInput) {
    return await firstValueFrom(
      this.fleetService.UpdateStation({ id, ...data }),
    );
  }

  async changeStationStatus(data: UpdateStationStatusInput) {
    return await firstValueFrom(this.fleetService.UpdateStationStatus(data));
  }

  async getAllStation(data: GetStationInput) {
    const response = await firstValueFrom(
      this.fleetService.GetAllStations(data),
    );
    const stations = response.data as Station[];
    return {
      ...response,
      data: stations
        ? stations.map((station) => ({
            ...station,
            bikes: station.bikes ?? [],
          }))
        : [],
      activeStation: response.activeStation,
      inactiveStation: response.inactiveStation,
    };
  }

  async getStation(data: { id: string }) {
    const response = await firstValueFrom(this.fleetService.GetStation(data));
    const station = response.data as Station;
    return {
      ...response,
      data: station
        ? {
            ...station,
            bikes: station.bikes ?? [],
          }
        : station,
    };
  }

  async getStationByIds(ids: string[]): Promise<Station[]> {
    const response = await firstValueFrom(
      this.fleetService.GetStationsByIds({ ids }),
    );
    return response.data || [];
  }

  async autoComplete(
    query: string,
    user: UserProfile,
  ): Promise<StationSearchResult[]> {
    const filter =
      user.role === Role.USER
        ? `status = '${StationStatus.Active}'`
        : undefined;
    const result = await meiliClient.index('Station').search(query, {
      limit: 10,
      filter,
    });
    return result.hits as StationSearchResult[];
  }

  async searchStation(
    page: number,
    limit: number,
    search: string,
    user: UserProfile,
  ): Promise<StationSearchPage> {
    const filter =
      user.role === Role.USER
        ? `status = '${StationStatus.Active}'`
        : undefined;
    const result = await meiliClient.index('Station').search(search, {
      limit,
      offset: (page - 1) * limit,
      filter,
    });
    return {
      data: result.hits as Station[],
      pagination: {
        total: result.estimatedTotalHits || 0,
        page,
        limit,
        totalPages: Math.ceil(result.estimatedTotalHits / limit),
      },
    };
  }
}
