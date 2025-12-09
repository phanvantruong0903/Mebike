import { Controller, Inject, UsePipes, ValidationPipe } from '@nestjs/common';
import {
  ClientKafka,
  EventPattern,
  GrpcMethod,
  Payload,
  RpcException,
} from '@nestjs/microservices';
import {
  BaseGrpcHandler,
  GRPC_SERVICES,
  grpcResponse,
  throwGrpcError,
  grpcPaginateResponse,
  prismaFleet,
  STATION_METHODS,
  STATION_MESSAGES,
  StationModel,
  CreateStationDto,
  UpdateStationDto,
  KAFKA_SERVICE,
  KAFKA_TOPIC,
  REDIS_CONSTANTS,
  REDIS_KEY_PREFIX,
  GetStationDto,
} from '@mebike/common';
import { StationService } from './station.service';
import Redis from 'ioredis';

@Controller()
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class StationController {
  private readonly baseHandler: BaseGrpcHandler<
    StationModel,
    CreateStationDto,
    UpdateStationDto
  >;

  constructor(
    private readonly stationService: StationService,
    @Inject(KAFKA_SERVICE.FLEET_SERVICE)
    private readonly kafkaClient: ClientKafka,
    @Inject(REDIS_CONSTANTS.REDIS_CLIENT)
    private readonly redisClient: Redis,
  ) {
    this.baseHandler = new BaseGrpcHandler(
      this.stationService,
      CreateStationDto,
      UpdateStationDto,
    );
  }

  @GrpcMethod(GRPC_SERVICES.FLEET, STATION_METHODS.UPDATE)
  async updateStation(
    data: UpdateStationDto & { id: string },
  ): Promise<ReturnType<typeof grpcResponse>> {
    try {
      const result = await this.baseHandler.updateLogic(data.id, data);

      this.kafkaClient.emit(KAFKA_TOPIC.STATION_UPDATED, {
        id: result.id,
        longitude: result.longitude,
        latitude: result.latitude,
      });
      return grpcResponse<StationModel>(
        result,
        STATION_MESSAGES.UPDATE_SUCCESS,
      );
    } catch (error) {
      if (error instanceof RpcException) {
        throw error;
      }
      const err = error as Error;
      throw new RpcException(err?.message || STATION_MESSAGES.UPDATE_FAIL);
    }
  }

  @GrpcMethod(GRPC_SERVICES.FLEET, STATION_METHODS.GET_ONE)
  async getStationDetail({
    id,
  }: {
    id: string;
  }): Promise<ReturnType<typeof grpcResponse>> {
    try {
      const result = await prismaFleet.station.findUnique({
        where: { id },
      });
      if (!result) {
        throwGrpcError(404, STATION_MESSAGES.NOT_FOUND, [
          STATION_MESSAGES.NOT_FOUND,
        ]);
      }

      return grpcResponse<StationModel>(
        result as unknown as StationModel,
        STATION_MESSAGES.GET_DETAIL_SUCCESS,
      );
    } catch (error) {
      if (error instanceof RpcException) {
        throw error;
      }
      const err = error as Error;
      throw new RpcException(err?.message || STATION_MESSAGES.UPDATE_FAIL);
    }
  }

  @GrpcMethod(GRPC_SERVICES.FLEET, STATION_METHODS.CREATE)
  async createStation(
    data: CreateStationDto,
  ): Promise<ReturnType<typeof grpcResponse>> {
    try {
      const result = await this.baseHandler.createLogic(data);

      this.kafkaClient.emit(KAFKA_TOPIC.STATION_CREATED, {
        id: result.id,
        longitude: result.longitude,
        latitude: result.latitude,
      });

      return grpcResponse<StationModel>(
        result,
        STATION_MESSAGES.CREATE_SUCCESS,
      );
    } catch (error) {
      if (error instanceof RpcException) {
        throw error;
      }
      const err = error as Error;
      throw new RpcException(err?.message || STATION_MESSAGES.CREATE_FAILED);
    }
  }

  @GrpcMethod(GRPC_SERVICES.FLEET, STATION_METHODS.GET_ALL)
  async getAllStation(
    data: GetStationDto,
  ): Promise<ReturnType<typeof grpcPaginateResponse>> {
    try {
      const { page, limit, longitude, latitude } = data;
      if (!longitude || !latitude) {
        const result = await this.baseHandler.getAllLogic(page, limit);
        return grpcPaginateResponse(result, STATION_MESSAGES.GET_ALL_SUCCESS);
      }

      // return dạng [[id, distance], [stationId, distance], ...]
      const geoResult = (await this.redisClient.georadius(
        REDIS_KEY_PREFIX.STATION,
        longitude,
        latitude,
        500,
        'km',
        'WITHDIST',
        'ASC',
      )) as [string, string][];

      const paginatedResult = geoResult.slice((page - 1) * limit, page * limit);
      const total = geoResult.length;

      if (paginatedResult.length === 0) {
        return grpcPaginateResponse(
          {
            data: [],
            limit: limit,
            page: page,
            total: total,
            totalPages: Math.ceil(total / limit),
          },
          STATION_MESSAGES.GET_ALL_SUCCESS,
        );
      }

      const stationIds = paginatedResult.map((item) => item[0]);
      const stations = await prismaFleet.station.findMany({
        where: {
          id: { in: stationIds },
        },
      });

      const stationMap = new Map(
        stations.map((station) => [station.id, station]),
      );

      // ghép station info vào cái mảng paginated redis trả ra dạng [id, distance]
      const result = paginatedResult
        .map((item) => {
          const id = item[0];
          const distance = Number.parseFloat(item[1]);
          const station = stationMap.get(id);

          if (!station) {
            return null;
          }

          return {
            ...station,
            distance,
          };
        })
        .filter((item) => item !== null);

      return grpcPaginateResponse(
        {
          data: result,
          limit: limit,
          page: page,
          total: total,
          totalPages: Math.ceil(total / limit),
        },
        STATION_MESSAGES.GET_ALL_SUCCESS,
      );
    } catch (error) {
      if (error instanceof RpcException) {
        throw error;
      }
      const err = error as Error;
      throw new RpcException(err?.message || STATION_MESSAGES.GET_ALL_FAIL);
    }
  }

  @EventPattern(KAFKA_TOPIC.STATION_CREATED)
  @EventPattern(KAFKA_TOPIC.STATION_UPDATED)
  async handleStationCreated(@Payload() data: any) {
    await this.redisClient.geoadd(
      REDIS_KEY_PREFIX.STATION,
      data.longitude,
      data.latitude,
      data.id,
    );
  }
}
