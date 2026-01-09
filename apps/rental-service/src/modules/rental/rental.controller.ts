import { Controller, UsePipes, ValidationPipe } from '@nestjs/common';
import { RentalService } from './rental.service';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import {
  BaseGrpcHandler,
  BikeResponse,
  buildFilter,
  buildSearchFilter,
  CreateRentalDto,
  EndRentalDto,
  GetRentalDto,
  GetRentalListDto,
  GRPC_SERVICES,
  grpcPaginateResponse,
  grpcResponse,
  RENTAL_MESSAGES,
  RENTAL_METHODS,
  RentalModel,
} from '@mebike/common';

@Controller()
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class RentalController {
  private readonly baseHandler: BaseGrpcHandler<RentalModel, CreateRentalDto>;
  constructor(private readonly rentalService: RentalService) {
    this.baseHandler = new BaseGrpcHandler(this.rentalService, CreateRentalDto);
  }

  @GrpcMethod(GRPC_SERVICES.RENTAL, RENTAL_METHODS.CREATE)
  async createRental(
    data: CreateRentalDto,
  ): Promise<ReturnType<typeof grpcResponse>> {
    try {
      const result = await this.rentalService.create(data);

      return grpcResponse<RentalModel>(result, RENTAL_MESSAGES.CREATE_SUCCESS);
    } catch (error) {
      if (error instanceof RpcException) {
        throw error;
      }
      const err = error as Error;
      console.log(err);
      throw new RpcException(err?.message || RENTAL_MESSAGES.CREATE_FAILED);
    }
  }

  @GrpcMethod(GRPC_SERVICES.RENTAL, RENTAL_METHODS.END)
  async endRental(
    data: EndRentalDto,
  ): Promise<ReturnType<typeof grpcResponse>> {
    try {
      const result = await this.rentalService.end(data);

      return grpcResponse<{
        updatedRental: RentalModel;
        updatedBike: BikeResponse;
      }>(result, RENTAL_MESSAGES.CREATE_SUCCESS);
    } catch (error) {
      if (error instanceof RpcException) {
        throw error;
      }
      const err = error as Error;
      throw new RpcException(err?.message || RENTAL_MESSAGES.CREATE_FAILED);
    }
  }

  @GrpcMethod(GRPC_SERVICES.RENTAL, RENTAL_METHODS.GET_ONE)
  async getRental(
    data: GetRentalDto,
  ): Promise<ReturnType<typeof grpcResponse>> {
    try {
      const result = await this.baseHandler.getOneById(data.id);

      if (!result) {
        throw new RpcException(RENTAL_MESSAGES.NOT_FOUND);
      }

      return grpcResponse<RentalModel>(result, RENTAL_MESSAGES.GET_ONE_SUCCESS);
    } catch (error) {
      if (error instanceof RpcException) {
        throw error;
      }
      const err = error as Error;
      throw new RpcException(err?.message || RENTAL_MESSAGES.GET_ONE_FAILED);
    }
  }

  @GrpcMethod(GRPC_SERVICES.RENTAL, RENTAL_METHODS.GET_ALL)
  async getAllRental(
    data: GetRentalListDto,
  ): Promise<ReturnType<typeof grpcPaginateResponse>> {
    try {
      const { page, limit, search, ...filterFields } = data;
      const filter = buildFilter(filterFields);

      const searchFields = ['startStation', 'endStation', 'status'];
      const searchFilter = buildSearchFilter(search, searchFields);

      const where = {
        ...filter,
        ...searchFilter,
      };

      const result = await this.baseHandler.getAllLogic(page, limit, where);
      return grpcPaginateResponse(result, RENTAL_MESSAGES.GET_ALL_SUCCESS);
    } catch (error) {
      if (error instanceof RpcException) {
        throw error;
      }
      const err = error as Error;
      throw new RpcException(err?.message || RENTAL_MESSAGES.GET_ALL_FAIL);
    }
  }

  @GrpcMethod(GRPC_SERVICES.RENTAL, RENTAL_METHODS.SUMMARIZE)
  async summarizeRental(): Promise<ReturnType<typeof grpcResponse>> {
    try {
      const [revenueSummary, hourlyRentalSummary] = await Promise.all([
        this.rentalService.getTodayRevenueSummary(),
        this.rentalService.getTodayRentalPerHour(),
      ]);
      return grpcResponse(
        {
          revenueSummary,
          hourlyRentalSummary,
        },
        RENTAL_MESSAGES.SUMMARIZE_SUCCESS,
      );
    } catch (error) {
      if (error instanceof RpcException) {
        throw error;
      }
      const err = error as Error;
      throw new RpcException(err?.message || RENTAL_MESSAGES.SUMMARIZE_FAIL);
    }
  }
}
