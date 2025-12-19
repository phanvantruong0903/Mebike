import { Controller, UsePipes, ValidationPipe } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import {
  BaseGrpcHandler,
  GRPC_SERVICES,
  grpcResponse,
  throwGrpcError,
  grpcPaginateResponse,
  prismaFleet,
  BIKE_METHODS,
  BIKE_MESSAGES,
  BikeModel,
  CreateBikeDto,
  UpdateBikeDto,
  GetBikeDto,
  buildSearchFilter,
  ChangeBikeStatusDto,
  STATION_MESSAGES,
} from '@mebike/common';
import { BikeService } from './bike.service';

@Controller()
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class BikeController {
  private readonly baseHandler: BaseGrpcHandler<
    BikeModel,
    CreateBikeDto,
    UpdateBikeDto
  >;

  constructor(private readonly bikeService: BikeService) {
    this.baseHandler = new BaseGrpcHandler(
      this.bikeService,
      CreateBikeDto,
      UpdateBikeDto,
    );
  }

  @GrpcMethod(GRPC_SERVICES.FLEET, BIKE_METHODS.UPDATE)
  async updateBike(
    data: UpdateBikeDto & { id: string },
  ): Promise<ReturnType<typeof grpcResponse>> {
    try {
      const result = await this.baseHandler.updateLogic(data.id, data);
      return grpcResponse<BikeModel>(result, BIKE_MESSAGES.UPDATE_SUCCESS);
    } catch (error) {
      if (error instanceof RpcException) {
        throw error;
      }
      const err = error as Error;
      throw new RpcException(err?.message || BIKE_MESSAGES.UPDATE_FAIL);
    }
  }

  @GrpcMethod(GRPC_SERVICES.FLEET, BIKE_METHODS.GET_ONE)
  async getBikeDetail({
    id,
  }: {
    id: string;
  }): Promise<ReturnType<typeof grpcResponse>> {
    try {
      const result = await prismaFleet.bike.findUnique({
        where: { id },
        include: {
          station: true,
          supplier: true,
        },
      });
      if (!result) {
        throwGrpcError(404, BIKE_MESSAGES.NOT_FOUND, [BIKE_MESSAGES.NOT_FOUND]);
      }

      return grpcResponse<BikeModel>(
        result as unknown as BikeModel,
        BIKE_MESSAGES.GET_DETAIL_SUCCESS,
      );
    } catch (error) {
      if (error instanceof RpcException) {
        throw error;
      }
      const err = error as Error;
      throw new RpcException(err?.message || BIKE_MESSAGES.UPDATE_FAIL);
    }
  }

  @GrpcMethod(GRPC_SERVICES.FLEET, BIKE_METHODS.CREATE)
  async createBike(
    data: CreateBikeDto,
  ): Promise<ReturnType<typeof grpcResponse>> {
    try {
      const findStation = await prismaFleet.station.findUnique({
        where: { id: data.stationId },
        include: {
          _count: {
            select: { bikes: true },
          },
        },
      });

      if (!findStation) {
        throwGrpcError(404, STATION_MESSAGES.NOT_FOUND, [
          STATION_MESSAGES.NOT_FOUND,
        ]);
      }

      const currentBikeCount = findStation._count.bikes;
      if (currentBikeCount >= findStation.capacity) {
        throwGrpcError(400, STATION_MESSAGES.STATION_FULL, [
          STATION_MESSAGES.STATION_FULL,
        ]);
      }

      const result = await this.baseHandler.createLogic(data);

      return grpcResponse<BikeModel>(result, BIKE_MESSAGES.CREATE_SUCCESS);
    } catch (error) {
      if (error instanceof RpcException) {
        throw error;
      }
      const err = error as Error;
      throw new RpcException(err?.message || BIKE_MESSAGES.CREATE_FAILED);
    }
  }

  @GrpcMethod(GRPC_SERVICES.FLEET, BIKE_METHODS.GET_ALL)
  async getAllBike(
    data: GetBikeDto,
  ): Promise<ReturnType<typeof grpcPaginateResponse>> {
    try {
      const searchFields = ['id', 'chipId', 'supplierId', 'stationId'];
      const searchFilter = buildSearchFilter(data.search, searchFields);

      const result = await this.baseHandler.getAllLogic(
        data.page,
        data.limit,
        searchFilter,
        undefined,
        {
          station: true,
          supplier: true,
        },
      );
      return grpcPaginateResponse(result, BIKE_MESSAGES.GET_ALL_SUCCESS);
    } catch (error) {
      if (error instanceof RpcException) {
        throw error;
      }
      const err = error as Error;
      throw new RpcException(err?.message || BIKE_MESSAGES.GET_ALL_FAIL);
    }
  }

  @GrpcMethod(GRPC_SERVICES.FLEET, BIKE_METHODS.CHANGE_STATUS)
  async changeStatus(
    data: ChangeBikeStatusDto,
  ): Promise<ReturnType<typeof grpcResponse>> {
    try {
      const { id, ...updatedData } = data;
      const profile = await prismaFleet.bike.update({
        where: { id },
        data: updatedData,
      });
      return grpcResponse(profile, BIKE_MESSAGES.UPDATE_SUCCESS);
    } catch (error: unknown) {
      if (error instanceof RpcException) {
        throw error;
      }

      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        error.code === 'P2025'
      ) {
        throwGrpcError(404, BIKE_MESSAGES.NOT_FOUND, [BIKE_MESSAGES.NOT_FOUND]);
      }
      const err = error as Error;
      throw new RpcException(err?.message);
    }
  }
}
