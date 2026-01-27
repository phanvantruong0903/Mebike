import { Controller, UsePipes, ValidationPipe } from '@nestjs/common';
import { ReservationService } from './reservation.service';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import {
  ActivateReservationDto,
  BaseGrpcHandler,
  buildFilter,
  buildSearchFilter,
  CreateReservationDto,
  GetReservationDto,
  GetReservationListDto,
  GRPC_SERVICES,
  grpcPaginateResponse,
  grpcResponse,
  RESERVATION_MESSAGES,
  RESERVATION_METHODS,
  ReservationModel,
} from '@mebike/common';

@Controller()
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class ReservationController {
  private readonly baseHandler: BaseGrpcHandler<
    ReservationModel,
    CreateReservationDto
  >;
  constructor(private readonly reservationService: ReservationService) {
    this.baseHandler = new BaseGrpcHandler(
      this.reservationService,
      CreateReservationDto,
    );
  }

  @GrpcMethod(GRPC_SERVICES.RENTAL, RESERVATION_METHODS.CREATE)
  async createReservation(
    data: CreateReservationDto,
  ): Promise<ReturnType<typeof grpcResponse>> {
    try {
      const result = await this.reservationService.create(data);

      return grpcResponse<ReservationModel>(
        result,
        RESERVATION_MESSAGES.CREATE_SUCCESS,
      );
    } catch (error) {
      if (error instanceof RpcException) {
        throw error;
      }
      const err = error as Error;
      console.log(err);
      throw new RpcException(
        err?.message || RESERVATION_MESSAGES.CREATE_FAILED,
      );
    }
  }

  @GrpcMethod(GRPC_SERVICES.RENTAL, RESERVATION_METHODS.ACTIVATE)
  async activateReservation(
    data: ActivateReservationDto,
  ): Promise<ReturnType<typeof grpcResponse>> {
    try {
      const result = await this.reservationService.activate(data);

      return grpcResponse<ReservationModel>(
        result,
        RESERVATION_MESSAGES.ACTIVATE_SUCCESS,
      );
    } catch (error) {
      if (error instanceof RpcException) {
        throw error;
      }
      const err = error as Error;
      throw new RpcException(
        err?.message || RESERVATION_MESSAGES.ACTIVATE_FAIL,
      );
    }
  }

  @GrpcMethod(GRPC_SERVICES.RENTAL, RESERVATION_METHODS.GET_ONE)
  async getReservation(
    data: GetReservationDto,
  ): Promise<ReturnType<typeof grpcResponse>> {
    try {
      const result = await this.baseHandler.getOneById(data.id);

      if (!result) {
        throw new RpcException(RESERVATION_MESSAGES.NOT_FOUND);
      }

      return grpcResponse<ReservationModel>(
        result,
        RESERVATION_MESSAGES.GET_ONE_SUCCESS,
      );
    } catch (error) {
      if (error instanceof RpcException) {
        throw error;
      }
      const err = error as Error;
      throw new RpcException(
        err?.message || RESERVATION_MESSAGES.GET_ONE_FAILED,
      );
    }
  }

  @GrpcMethod(GRPC_SERVICES.RENTAL, RESERVATION_METHODS.GET_ALL)
  async getAllReservation(
    data: GetReservationListDto,
  ): Promise<ReturnType<typeof grpcPaginateResponse>> {
    try {
      const { page, limit, search, ...filterFields } = data;
      const filter = buildFilter(filterFields);

      const searchFields = ['accountId', 'stationId', 'status'];
      const searchFilter = buildSearchFilter(search, searchFields);

      const where = {
        ...filter,
        ...searchFilter,
      };

      const result = await this.baseHandler.getAllLogic(page, limit, where);
      return grpcPaginateResponse(result, RESERVATION_MESSAGES.GET_ALL_SUCCESS);
    } catch (error) {
      if (error instanceof RpcException) {
        throw error;
      }
      const err = error as Error;
      throw new RpcException(err?.message || RESERVATION_MESSAGES.GET_ALL_FAIL);
    }
  }
}
