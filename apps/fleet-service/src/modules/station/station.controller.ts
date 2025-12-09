import { Controller, UsePipes, ValidationPipe } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
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
} from '@mebike/common';
import { StationService } from './station.service';

@Controller()
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class StationController {
  private readonly baseHandler: BaseGrpcHandler<
    StationModel,
    CreateStationDto,
    UpdateStationDto
  >;

  constructor(private readonly stationService: StationService) {
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
  async getAllStation(data: {
    page: number;
    limit: number;
  }): Promise<ReturnType<typeof grpcPaginateResponse>> {
    try {
      const { page, limit } = data;
      const result = await this.baseHandler.getAllLogic(page, limit);
      return grpcPaginateResponse(result, STATION_MESSAGES.GET_ALL_SUCCESS);
    } catch (error) {
      if (error instanceof RpcException) {
        throw error;
      }
      const err = error as Error;
      throw new RpcException(err?.message || STATION_MESSAGES.GET_ALL_FAIL);
    }
  }
}
