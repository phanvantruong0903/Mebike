import { Injectable, Inject } from '@nestjs/common';
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
  BikeModel,
  BikeStatus,
  SOS_MESSAGES,
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
  bikes: [BikeModel];
}

@Injectable()
export class SosService extends BaseService<
  SosModel,
  CreateSosDto,
  UpdateSosDto
> {
  private rentalServiceClient!: RentalServiceClient;
  private stationServiceClient!: FleetServiceClient;
  private userServiceClient!: UserServiceClient;

  constructor(
    @Inject(REDIS_CONSTANTS.REDIS_CLIENT)
    private readonly redisClient: Redis,
    @Inject(GRPC_PACKAGE.RENTAL) private readonly rentalClient: ClientGrpc,
    @Inject(GRPC_PACKAGE.FLEET) private readonly stationClient: ClientGrpc,
    @Inject(GRPC_PACKAGE.USER) private readonly userClient: ClientGrpc,
  ) {
    super(prismaIncident.emergencyRequest);
    this.initialize();
  }

  private initialize() {
    this.rentalServiceClient =
      this.rentalClient.getService<RentalServiceClient>(GRPC_SERVICES.RENTAL);
    this.stationServiceClient =
      this.stationClient.getService<FleetServiceClient>(GRPC_SERVICES.FLEET);
    this.userServiceClient = this.userClient.getService<UserServiceClient>(
      GRPC_SERVICES.USER,
    );
  }

  async getRentalById(id: string) {
    return await firstValueFrom(this.rentalServiceClient.GetRental({ id }));
  }

  async getStationsByIds(ids: string[]) {
    const response = await firstValueFrom(
      this.stationServiceClient.GetStationsByIds({ ids }),
    );
    return (response.data as StationModel[]) ?? [];
  }

  async findSosStation(stationId: string) {
    const response = await firstValueFrom(
      this.userServiceClient.FindFreeSos({ stationId }),
    );
    return (response.data as Profile[]) ?? [];
  }

  async checkStationExist(id: string) {
    return await firstValueFrom(this.stationServiceClient.StationExist({ id }));
  }

  async getStationById(id: string) {
    return await firstValueFrom(this.stationServiceClient.GetStation({ id }));
  }

  async createSos(data: CreateSosDto) {
    const existed = await this.existedSos(data.rentalId);
    if (existed) {
      throwGrpcError(409, SOS_MESSAGES.EXISTED, [SOS_MESSAGES.EXISTED]);
    }

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
      throwGrpcError(404, STATION_MESSAGES.NO_STATION_NEARBY, [
        STATION_MESSAGES.NOT_FOUND,
      ]);
    }

    let selectedStation = null;
    let selectedSos = null;
    let selectedBike = null;

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

        const availableBikes = stationData.bikes?.filter(
          (bike) => bike.status === BikeStatus.Available,
        );

        if (!availableBikes || availableBikes.length === 0) {
          continue;
        }

        selectedBike = availableBikes[0];
      }

      selectedStation = station;
      selectedSos = freeSos[0];
      break;
    }

    if (!selectedStation || !selectedSos) {
      const errorMessage = data.isContinuingRental
        ? STATION_MESSAGES.NO_STATION_NEARBY_AND_BIKE
        : STATION_MESSAGES.NO_STATION_NEARBY;

      throwGrpcError(404, errorMessage, [STATION_MESSAGES.NOT_FOUND]);
    }

    return await prismaIncident.emergencyRequest.create({
      data: {
        ...data,
        bikeId: selectedBike?.id || '',
        stationId: selectedStation.id,
        agentId: selectedSos.accountId,
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
    const allSos = await this.findSosStation(stationId);

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

    return allSos.filter((sos) => !busyIds.has(sos.accountId));
  }

  private async existedSos(rentalId: string) {
    const existed = await prismaIncident.emergencyRequest.findFirst({
      where: {
        rentalId,
        status: {
          notIn: [EmergencyStatus.Cancelled],
        },
      },
    });

    return !!existed;
  }

  async deleteSos(id: string) {
    return await prismaIncident.emergencyRequest.delete({
      where: {
        id,
      },
    });
  }
}
