import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import {
  BaseService,
  REDIS_CONSTANTS,
  SosModel,
  CreateSosDto,
  UpdateSosDto,
  prismaIncident,
  GRPC_PACKAGE,
  GetRentalDto,
  RentalModel,
  grpcResponse,
  GRPC_SERVICES,
  RENTAL_MESSAGES,
  throwGrpcError,
  REDIS_KEY_PREFIX,
  StationModel,
  grpcPaginateResponse,
  Profile,
  EmergencyStatus,
  STATION_MESSAGES,
} from '@mebike/common';
import Redis from 'ioredis';
import { type ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom, Observable } from 'rxjs';

interface RentalServiceClient {
  GetRental(
    data: GetRentalDto,
  ): Observable<ReturnType<typeof grpcResponse<RentalModel>>>;
}

interface FleetServiceClient {
  GetStationsByIds(data: {
    ids: string[];
  }): Observable<ReturnType<typeof grpcResponse<StationModel[]>>>;
  StationExist(data: {
    id: string;
  }): Observable<ReturnType<typeof grpcResponse<{ exists: boolean }>>>;
  GetStation(data: {
    id: string;
  }): Observable<ReturnType<typeof grpcResponse<StationModel>>>;
}

interface UserServiceClient {
  FindFreeSos(data: {
    stationId: string;
  }): Observable<ReturnType<typeof grpcPaginateResponse<Profile>>>;
}

interface StationWithAvailability extends StationModel {
  availableBike: number;
}

@Injectable()
export class SosService
  extends BaseService<SosModel, CreateSosDto, UpdateSosDto>
  implements OnModuleInit
{
  private rentalServiceClient!: RentalServiceClient;
  private fleetServiceClient!: FleetServiceClient;
  private userServiceClient!: UserServiceClient;

  constructor(
    @Inject(REDIS_CONSTANTS.REDIS_CLIENT)
    private readonly redisClient: Redis,
    @Inject(GRPC_PACKAGE.RENTAL) private readonly rentalClient: ClientGrpc,
    @Inject(GRPC_PACKAGE.FLEET) private readonly fleetClient: ClientGrpc,
    @Inject(GRPC_PACKAGE.USER) private readonly userClient: ClientGrpc,
  ) {
    super(prismaIncident.emergencyRequest);
  }
  onModuleInit() {
    this.rentalServiceClient =
      this.rentalClient.getService<RentalServiceClient>(GRPC_SERVICES.RENTAL);
    this.fleetServiceClient = this.fleetClient.getService<FleetServiceClient>(
      GRPC_SERVICES.FLEET,
    );
    this.userServiceClient = this.userClient.getService<UserServiceClient>(
      GRPC_SERVICES.USER,
    );
  }

  async getRentalById(id: string) {
    return await firstValueFrom(this.rentalServiceClient.GetRental({ id }));
  }

  async getStationsByIds(ids: string[]) {
    const response = await firstValueFrom(
      this.fleetServiceClient.GetStationsByIds({ ids }),
    );
    return (response.data as StationModel[]) ?? [];
  }

  async findFreeSos(stationId: string) {
    const response = await firstValueFrom(
      this.userServiceClient.FindFreeSos({ stationId }),
    );
    return (response.data as Profile[]) ?? [];
  }

  async checkStationExist(id: string) {
    return await firstValueFrom(this.fleetServiceClient.StationExist({ id }));
  }

  async getStationById(id: string) {
    return await firstValueFrom(this.fleetServiceClient.GetStation({ id }));
  }

  async createSos(data: CreateSosDto) {
    const findRental = await this.getRentalById(data.rentalId);
    const rental = findRental.data as RentalModel;

    if (!rental) {
      throwGrpcError(404, RENTAL_MESSAGES.NOT_FOUND, [
        RENTAL_MESSAGES.NOT_FOUND,
      ]);
    }

    const stations = await this.findNearestStation({
      latitude: data.latitude,
      longitude: data.longitude,
    });
    if (stations.length === 0) {
      throwGrpcError(404, STATION_MESSAGES.NOT_FOUND, [
        STATION_MESSAGES.NO_STATION_NEARBY,
      ]);
    }

    let selectedStation = null;
    let selectedSos = null;
    for (const station of stations) {
      const freeSos = await this.findFreeSosForStation(station.id);
      if (freeSos.length === 0) {
        continue;
      }

      if (data.isContinuingRental) {
        const availableBike = await this.getStationById(station.id);
        const stationData = availableBike.data as StationWithAvailability;

        if (stationData?.availableBike === 0) {
          continue;
        }
      }

      selectedStation = station;
      selectedSos = freeSos[0];
      break;
    }

    if (!selectedStation || !selectedSos) {
      throwGrpcError(
        404,
        STATION_MESSAGES.NOT_FOUND,
        data.isContinuingRental
          ? [STATION_MESSAGES.NO_STATION_NEARBY_AND_BIKE]
          : [STATION_MESSAGES.NO_STATION_NEARBY],
      );
    }

    return await prismaIncident.emergencyRequest.create({
      data: {
        ...data,
        stationId: selectedStation.id,
        agentId: selectedSos.id,
      },
    });
  }

  // return dạng [{station: StationModel, distance: number}]
  private async findNearestStation(data: {
    latitude: number;
    longitude: number;
  }) {
    const geoResult = (await this.redisClient.georadius(
      REDIS_KEY_PREFIX.STATION,
      data.longitude,
      data.latitude,
      500,
      'km',
      'WITHDIST',
      'ASC',
    )) as [string, string][];

    if (!geoResult.length) {
      return [];
    }

    const stations = await this.getStationsByIds(
      geoResult.map((station) => station[0]),
    );
    const distanceMap = new Map(
      geoResult.map((station) => [station[0], Number.parseFloat(station[1])]),
    );

    return stations.map((station) => ({
      ...station,
      distance: distanceMap.get(station.id),
    }));
  }

  private async findFreeSosForStation(stationId: string) {
    const allSos = await this.findFreeSos(stationId);

    const busySos = await prismaIncident.emergencyRequest.findMany({
      where: {
        stationId,
        status: {
          in: [EmergencyStatus.Assigned, EmergencyStatus.Processing],
        },
      },
      select: {
        agentId: true,
      },
    });

    const busyIds = new Set(busySos.map((a) => a.agentId));

    return allSos.filter((sos) => !busyIds.has(sos.id));
  }
}
