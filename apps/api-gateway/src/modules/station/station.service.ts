import {
  Inject,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { Observable, firstValueFrom } from 'rxjs';
import {
  GRPC_PACKAGE,
  GRPC_SERVICES,
  CreateStationInput,
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
  GetStationDto,
  STATION_MESSAGES,
} from '@mebike/common';

interface StationServiceClient {
  GetStation(data: { id: string }): Observable<StationResponse>;
  UpdateStation(
    data: UpdateStationInput & { id: string },
  ): Observable<StationResponse>;
  GetAllStations(data: GetStationDto): Observable<StationListResponse>;
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

  async getAllStation(data: GetStationDto) {
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

  async getStation(data: { id: string }, user?: UserProfile) {
    const response = await firstValueFrom(this.fleetService.GetStation(data));
    const station = response.data as Station;

    const isAdmin = user?.role === Role.ADMIN && user?.role;
    const isInactive = station?.status !== StationStatus.Active;

    if (station && isInactive && !isAdmin) {
      throw new NotFoundException(STATION_MESSAGES.NOT_FOUND);
    }

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
    user?: UserProfile,
  ): Promise<StationSearchResult> {
    let filter;
    if (user?.role === Role.ADMIN) {
      filter = undefined;
    } else {
      filter = `status = '${StationStatus.Active}'`;
    }
    const result = await meiliClient.index('Station').search(query, {
      limit: 10,
      filter,
    });
    return { data: (result.hits as Station[]) ?? [] };
  }

  async searchStation(
    page: number,
    limit: number,
    search: string,
    user?: UserProfile,
  ): Promise<StationSearchPage> {
    let filter;
    if (user?.role === Role.ADMIN) {
      filter = undefined;
    } else {
      filter = `status = '${StationStatus.Active}'`;
    }
    const result = await meiliClient.index('Station').search(search, {
      limit,
      offset: (page - 1) * limit,
      filter,
    });
    return {
      data: (result.hits as Station[]) ?? [],
      pagination: {
        total: result.estimatedTotalHits || 0,
        page,
        limit,
        totalPages: Math.ceil(result.estimatedTotalHits / limit),
      },
    };
  }
}
