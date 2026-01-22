import { Controller, UsePipes, ValidationPipe } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import {
  BaseGrpcHandler,
  GRPC_SERVICES,
  grpcResponse,
  grpcPaginateResponse,
  BIKE_METHODS,
  BIKE_MESSAGES,
  BikeModel,
  CreateBikeDto,
  UpdateBikeDto,
  GetBikeDto,
  ChangeBikeStatusDto,
  GetBikeDetailDto,
  GetBikesByIdsDto,
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
    const result = await this.baseHandler.updateLogic(data.id, data);
    return grpcResponse<BikeModel>(result, BIKE_MESSAGES.UPDATE_SUCCESS);
  }

  @GrpcMethod(GRPC_SERVICES.FLEET, BIKE_METHODS.GET_ONE)
  async getBikeDetail(
    data: GetBikeDetailDto,
  ): Promise<ReturnType<typeof grpcResponse>> {
    const result = await this.bikeService.getBikeDetail(data.id);
    return grpcResponse<BikeModel>(result, BIKE_MESSAGES.GET_DETAIL_SUCCESS);
  }

  @GrpcMethod(GRPC_SERVICES.FLEET, BIKE_METHODS.CREATE)
  async createBike(
    data: CreateBikeDto,
  ): Promise<ReturnType<typeof grpcResponse>> {
    const result = await this.bikeService.createBike(data);
    return grpcResponse<BikeModel>(result, BIKE_MESSAGES.CREATE_SUCCESS);
  }

  @GrpcMethod(GRPC_SERVICES.FLEET, BIKE_METHODS.GET_ALL)
  async getAllBike(
    data: GetBikeDto,
  ): Promise<ReturnType<typeof grpcPaginateResponse>> {
    const filter: any = {};
    if (data.stationId) {
      filter.stationId = data.stationId;
    }
    if (data.status) {
      filter.status = data.status;
    }
    if (data.supplierId) {
      filter.supplierId = data.supplierId;
    }

    const result = await this.baseHandler.getAllLogic(
      data.page,
      data.limit,
      filter,
      undefined,
      {
        station: true,
        supplier: true,
      },
    );
    return grpcPaginateResponse(result, BIKE_MESSAGES.GET_ALL_SUCCESS);
  }

  @GrpcMethod(GRPC_SERVICES.FLEET, BIKE_METHODS.CHANGE_STATUS)
  async changeStatus(
    data: ChangeBikeStatusDto,
  ): Promise<ReturnType<typeof grpcResponse>> {
    const { id, ...updatedData } = data;
    const profile = await this.bikeService.changeBikeStatus(
      id,
      updatedData.status,
    );
    return grpcResponse(profile, BIKE_MESSAGES.UPDATE_SUCCESS);
  }

  @GrpcMethod(GRPC_SERVICES.FLEET, BIKE_METHODS.GET_BIKES_BY_IDS)
  async getBikesByIds(
    data: GetBikesByIdsDto,
  ): Promise<ReturnType<typeof grpcResponse>> {
    const { ids } = data;
    const bikes = await this.bikeService.getBikesByIds(ids);
    return grpcResponse(bikes, BIKE_MESSAGES.GET_ALL_SUCCESS);
  }
}
