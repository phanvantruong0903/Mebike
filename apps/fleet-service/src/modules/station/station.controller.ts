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
  UpdateStationStatusDto,
  GetStationDetailDto,
  GetStationsByIdsDto,
  StationExistDto,
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
  async getStationDetail(
    data: GetStationDetailDto,
  ): Promise<ReturnType<typeof grpcResponse>> {
    try {
      const result = await this.stationService.getStationDetail(data.id);
      return grpcResponse<StationModel>(
        result,
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
      const result = await this.stationService.getAllStations(data);
      return {
        ...grpcPaginateResponse(
          {
            data: result.data,
            total: result.total,
            page: result.page,
            limit: result.limit,
            totalPages: result.totalPages,
          },
          STATION_MESSAGES.GET_ALL_SUCCESS,
        ),
        ...result.stats,
      };
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

  @GrpcMethod(GRPC_SERVICES.FLEET, STATION_METHODS.GET_STATIONS_BY_IDS)
  async getStationsByIds(
    data: GetStationsByIdsDto,
  ): Promise<ReturnType<typeof grpcResponse>> {
    const { ids } = data;
    const stations = await this.stationService.getStationsByIds(ids);
    return grpcResponse(stations, STATION_MESSAGES.GET_ALL_SUCCESS);
  }

  @GrpcMethod(GRPC_SERVICES.FLEET, STATION_METHODS.UPDATE_STATUS)
  async updateStationStatus(data: UpdateStationStatusDto) {
    try {
      const { id, ...updatedData } = data;
      const station = await this.stationService.updateStationStatus(
        id,
        updatedData.status,
      );
      return grpcResponse(station, STATION_MESSAGES.UPDATE_SUCCESS);
    } catch (error) {
      if (error instanceof RpcException) {
        throw error;
      }

      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        error.code === 'P2025'
      ) {
        throwGrpcError(404, STATION_MESSAGES.NOT_FOUND, [
          STATION_MESSAGES.NOT_FOUND,
        ]);
      }
      const err = error as Error;
      throw new RpcException(err?.message);
    }
  }

  async getStationStats() {
    const { activeStation, inactiveStation } =
      await this.stationService.getStationStats();

    return { activeStation, inactiveStation };
  }

  @GrpcMethod(GRPC_SERVICES.FLEET, STATION_METHODS.STATION_EXIST)
  async stationExist(
    data: StationExistDto,
  ): Promise<ReturnType<typeof grpcResponse>> {
    const exists = await this.stationService.checkStationExist(data.id);
    return grpcResponse(
      { exists },
      exists ? STATION_MESSAGES.GET_DETAIL_SUCCESS : STATION_MESSAGES.NOT_FOUND,
    );
  }
}
