import { Controller, UsePipes, ValidationPipe } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { RackService } from './rack.service';
import {
  GRPC_SERVICES,
  WAREHOUSE_MESSAGES,
  CreateRackDto,
  UpdateRackDto,
  grpcResponse,
  grpcPaginateResponse,
  WAREHOUSE_METHODS,
  BaseGrpcHandler,
  Rack,
  buildSearchFilter,
} from '@loginex/common';

@Controller()
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class RackController {
  private readonly baseHandler: BaseGrpcHandler<
    Rack,
    CreateRackDto,
    UpdateRackDto
  >;
  constructor(private readonly rackService: RackService) {
    this.baseHandler = new BaseGrpcHandler(
      this.rackService,
      CreateRackDto,
      UpdateRackDto,
    );
  }

  @GrpcMethod(GRPC_SERVICES.RACK, WAREHOUSE_METHODS.CREATE_RACK)
  async createRack(
    data: CreateRackDto,
  ): Promise<ReturnType<typeof grpcResponse<Rack>>> {
    try {
      const result = await this.baseHandler.createLogic(data);
      return grpcResponse(result, WAREHOUSE_MESSAGES.RACK_CREATED);
    } catch (error) {
      if (error instanceof RpcException) {
        throw error;
      }
      const err = error as Error;
      throw new RpcException(
        err?.message || WAREHOUSE_MESSAGES.RACK_CREATED_FAILED,
      );
    }
  }

  @GrpcMethod(GRPC_SERVICES.RACK, WAREHOUSE_METHODS.UPDATE_RACK)
  async updateRack(
    data: UpdateRackDto & { id: string },
  ): Promise<ReturnType<typeof grpcResponse<Rack>>> {
    try {
      const { id, ...updateData } = data;
      const result = await this.baseHandler.updateLogic(id, updateData);
      return grpcResponse(result, WAREHOUSE_MESSAGES.RACK_UPDATED);
    } catch (error) {
      if (error instanceof RpcException) {
        throw error;
      }
      const err = error as Error;
      throw new RpcException(
        err?.message || WAREHOUSE_MESSAGES.RACK_UPDATED_FAILED,
      );
    }
  }

  @GrpcMethod(GRPC_SERVICES.RACK, WAREHOUSE_METHODS.DELETE_RACK)
  async deleteRack(data: {
    id: string;
  }): Promise<ReturnType<typeof grpcResponse<null>>> {
    try {
      await this.baseHandler.deleteLogic(data.id);
      return grpcResponse(null, WAREHOUSE_MESSAGES.RACK_DELETED);
    } catch (error) {
      if (error instanceof RpcException) {
        throw error;
      }
      const err = error as Error;
      throw new RpcException(
        err?.message || WAREHOUSE_MESSAGES.RACK_DELETED_FAILED,
      );
    }
  }

  @GrpcMethod(GRPC_SERVICES.RACK, WAREHOUSE_METHODS.LIST_RACKS)
  async listRacks(data: {
    zoneId: string;
    page: number;
    limit: number;
    search?: string;
  }): Promise<ReturnType<typeof grpcPaginateResponse<Rack>>> {
    try {
      const searchFields = ['code'];
      const searchFilter = buildSearchFilter(data.search, searchFields);

      const { data: racks, ...meta } = await this.baseHandler.getAllLogic(
        data.page,
        data.limit,
        { zoneId: data.zoneId, ...searchFilter },
      );
      return grpcPaginateResponse(
        { data: racks, ...meta },
        WAREHOUSE_MESSAGES.RACK_LIST_SUCCESS,
      );
    } catch (error) {
      if (error instanceof RpcException) {
        throw error;
      }
      const err = error as Error;
      throw new RpcException(
        err?.message || WAREHOUSE_MESSAGES.RACK_LIST_FAILED,
      );
    }
  }
}
