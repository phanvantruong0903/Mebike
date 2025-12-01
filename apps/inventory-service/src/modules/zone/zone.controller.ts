import { Controller, UsePipes, ValidationPipe } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { ZoneService } from './zone.service';
import {
  GRPC_SERVICES,
  WAREHOUSE_MESSAGES,
  CreateZoneDto,
  UpdateZoneDto,
  grpcResponse,
  grpcPaginateResponse,
  WAREHOUSE_METHODS,
  BaseGrpcHandler,
  Zone,
  buildSearchFilter,
} from '@loginex/common';

@Controller()
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class ZoneController {
  private readonly baseHandler: BaseGrpcHandler<
    Zone,
    CreateZoneDto,
    UpdateZoneDto
  >;
  constructor(private readonly zoneService: ZoneService) {
    this.baseHandler = new BaseGrpcHandler(
      this.zoneService,
      CreateZoneDto,
      UpdateZoneDto,
    );
  }
  @GrpcMethod(GRPC_SERVICES.ZONE, WAREHOUSE_METHODS.CREATE_ZONE)
  async createZone(
    data: CreateZoneDto,
  ): Promise<ReturnType<typeof grpcResponse<Zone>>> {
    try {
      const result = await this.baseHandler.createLogic(data);
      return grpcResponse(result, WAREHOUSE_MESSAGES.ZONE_CREATED);
    } catch (error) {
      if (error instanceof RpcException) {
        throw error;
      }
      const err = error as Error;
      throw new RpcException(
        err?.message || WAREHOUSE_MESSAGES.ZONE_CREATED_FAILED,
      );
    }
  }

  @GrpcMethod(GRPC_SERVICES.ZONE, WAREHOUSE_METHODS.UPDATE_ZONE)
  async updateZone(
    data: UpdateZoneDto & { id: string },
  ): Promise<ReturnType<typeof grpcResponse<Zone>>> {
    try {
      const { id, ...updateData } = data;
      const result = await this.baseHandler.updateLogic(id, updateData);
      return grpcResponse(result, WAREHOUSE_MESSAGES.ZONE_UPDATED);
    } catch (error) {
      if (error instanceof RpcException) {
        throw error;
      }
      const err = error as Error;
      throw new RpcException(
        err?.message || WAREHOUSE_MESSAGES.ZONE_UPDATED_FAILED,
      );
    }
  }

  @GrpcMethod(GRPC_SERVICES.ZONE, WAREHOUSE_METHODS.DELETE_ZONE)
  async deleteZone(data: {
    id: string;
  }): Promise<ReturnType<typeof grpcResponse<null>>> {
    try {
      await this.baseHandler.deleteLogic(data.id);
      return grpcResponse(null, WAREHOUSE_MESSAGES.ZONE_DELETED);
    } catch (error) {
      if (error instanceof RpcException) {
        throw error;
      }
      const err = error as Error;
      throw new RpcException(
        err?.message || WAREHOUSE_MESSAGES.ZONE_DELETED_FAILED,
      );
    }
  }

  @GrpcMethod(GRPC_SERVICES.ZONE, WAREHOUSE_METHODS.LIST_ZONES)
  async listZones(data: {
    wareHouseId: string;
    page: number;
    limit: number;
    search?: string;
  }): Promise<ReturnType<typeof grpcPaginateResponse<Zone>>> {
    try {
      const searchFields = ['name'];
      const searchFilter = buildSearchFilter(data.search, searchFields);

      const { data: zones, ...meta } = await this.baseHandler.getAllLogic(
        data.page,
        data.limit,
        { wareHouseId: data.wareHouseId, ...searchFilter },
      );
      return grpcPaginateResponse(
        { data: zones, ...meta },
        WAREHOUSE_MESSAGES.ZONE_LIST_SUCCESS,
      );
    } catch (error) {
      if (error instanceof RpcException) {
        throw error;
      }
      const err = error as Error;
      throw new RpcException(
        err?.message || WAREHOUSE_MESSAGES.ZONE_LIST_FAILED,
      );
    }
  }
}
