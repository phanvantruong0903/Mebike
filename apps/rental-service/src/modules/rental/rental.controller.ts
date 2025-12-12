import { Controller } from '@nestjs/common';
import { RentalService } from './rental.service';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import {
  CreateRentalDto,
  EndRentalDto,
  GRPC_SERVICES,
  grpcResponse,
  RENTAL_MESSAGES,
  RENTAL_METHODS,
  RentalModel,
} from '@mebike/common';

@Controller()
export class RentalController {
  constructor(private readonly rentalService: RentalService) {}

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
      throw new RpcException(err?.message || RENTAL_MESSAGES.CREATE_FAILED);
    }
  }

  @GrpcMethod(GRPC_SERVICES.RENTAL, RENTAL_METHODS.END)
  async endRental(
    data: EndRentalDto,
  ): Promise<ReturnType<typeof grpcResponse>> {
    try {
      const result = await this.rentalService.end(data);

      return grpcResponse<RentalModel>(result, RENTAL_MESSAGES.CREATE_SUCCESS);
    } catch (error) {
      if (error instanceof RpcException) {
        throw error;
      }
      const err = error as Error;
      throw new RpcException(err?.message || RENTAL_MESSAGES.CREATE_FAILED);
    }
  }
}
