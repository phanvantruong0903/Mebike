import { Controller, UsePipes, ValidationPipe } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import {
  GRPC_SERVICES,
  grpcResponse,
  throwGrpcError,
  grpcPaginateResponse,
  SERVER_MESSAGE,
  CreateSupplierDto,
  UpdateSupplierDto,
  SUPPLIER_METHODS,
  SUPPLIER_MESSAGES,
  ChangeSupplierStatusDto,
  SupplierModel,
  GetSupplierDetailDto,
  GetSupplierDto,
  GetSuppliersByIdsDto,
} from '@mebike/common';
import { SupplierService } from './supllier.service';

@Controller()
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class SupplierController {
  constructor(private readonly supplierService: SupplierService) {}

  @GrpcMethod(GRPC_SERVICES.FLEET, SUPPLIER_METHODS.UPDATE)
  async updateSupplier(
    data: UpdateSupplierDto & { id: string },
  ): Promise<ReturnType<typeof grpcResponse>> {
    try {
      const { id, address, phone, ...rest } = data;
      const result = await this.supplierService.updateSupplier(id, {
        ...rest,
        address,
        phone,
      });
      return grpcResponse<SupplierModel>(
        result,
        SUPPLIER_MESSAGES.UPDATE_SUCCESS,
      );
    } catch (error) {
      if (error instanceof RpcException) {
        throw error;
      }
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        (error as any).code === 'P2002'
      ) {
        throwGrpcError(409, SUPPLIER_MESSAGES.EXIST, [SUPPLIER_MESSAGES.EXIST]);
      }
      const err = error as Error;
      throw new RpcException(err?.message || SUPPLIER_MESSAGES.UPDATE_FAIL);
    }
  }

  @GrpcMethod(GRPC_SERVICES.FLEET, SUPPLIER_METHODS.GET_ONE)
  async getSupplierDetail(
    data: GetSupplierDetailDto,
  ): Promise<ReturnType<typeof grpcResponse>> {
    try {
      const result = await this.supplierService.getSupplierDetail(data.id);
      return grpcResponse<SupplierModel>(
        result,
        SUPPLIER_MESSAGES.GET_DETAIL_SUCCESS,
      );
    } catch (error) {
      if (error instanceof RpcException) {
        throw error;
      }
      const err = error as Error;
      throw new RpcException(err?.message || SUPPLIER_MESSAGES.UPDATE_FAIL);
    }
  }

  @GrpcMethod(GRPC_SERVICES.FLEET, SUPPLIER_METHODS.CREATE)
  async createSupplier(
    data: CreateSupplierDto,
  ): Promise<ReturnType<typeof grpcResponse>> {
    try {
      const result = await this.supplierService.createSupplier(data as any);
      return grpcResponse<SupplierModel>(
        result,
        SUPPLIER_MESSAGES.CREATE_SUCCESS,
      );
    } catch (error: any) {
      if (error instanceof RpcException) {
        throw error;
      }
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        error.code === 'P2002'
      ) {
        throwGrpcError(409, SUPPLIER_MESSAGES.EXIST, [SUPPLIER_MESSAGES.EXIST]);
      }
      const err = error as Error;
      throw new RpcException(err?.message || SUPPLIER_MESSAGES.CREATE_FAILED);
    }
  }

  @GrpcMethod(GRPC_SERVICES.FLEET, SUPPLIER_METHODS.GET_ALL)
  async getAllSuppliers(
    data: GetSupplierDto,
  ): Promise<ReturnType<typeof grpcPaginateResponse>> {
    try {
      const result = await this.supplierService.getAllSuppliers(data);
      return grpcPaginateResponse(result, SUPPLIER_MESSAGES.GET_ALL_SUCCESS);
    } catch (error) {
      if (error instanceof RpcException) {
        throw error;
      }
      const err = error as Error;
      throw new RpcException(err?.message || SUPPLIER_MESSAGES.GET_ALL_FAIL);
    }
  }

  @GrpcMethod(GRPC_SERVICES.FLEET, SUPPLIER_METHODS.CHANGE_STATUS)
  async changeStatus(
    data: ChangeSupplierStatusDto,
  ): Promise<ReturnType<typeof grpcResponse>> {
    try {
      const { id, ...updatedData } = data;
      const profile = await this.supplierService.changeSupplierStatus(
        id,
        updatedData.status,
      );
      return grpcResponse(profile, SUPPLIER_MESSAGES.UPDATE_SUCCESS);
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
        throwGrpcError(404, SERVER_MESSAGE.NOT_FOUND, [
          SUPPLIER_MESSAGES.NOT_FOUND,
        ]);
      }
      const err = error as Error;
      throw new RpcException(err?.message);
    }
  }

  @GrpcMethod(GRPC_SERVICES.FLEET, SUPPLIER_METHODS.GET_STATS)
  async getSupplierStats() {
    const result = await this.supplierService.getSupplierStat();
    return grpcResponse(result, SUPPLIER_MESSAGES.GET_ALL_STATS_SUCCESS);
  }

  @GrpcMethod(GRPC_SERVICES.FLEET, SUPPLIER_METHODS.GET_SUPPLIERS_BY_IDS)
  async getSupplierByIds(data: GetSuppliersByIdsDto) {
    const result = await this.supplierService.getSuppliersByIds(data.ids);
    return grpcResponse(result, SUPPLIER_MESSAGES.GET_ALL_SUCCESS);
  }
}
