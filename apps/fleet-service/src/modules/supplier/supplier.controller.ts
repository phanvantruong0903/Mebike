import { Controller, UsePipes, ValidationPipe } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import {
  BaseGrpcHandler,
  GRPC_SERVICES,
  grpcResponse,
  throwGrpcError,
  grpcPaginateResponse,
  SERVER_MESSAGE,
  CreateSupplierDto,
  UpdateSupplierDto,
  prismaFleet,
  SUPPLIER_METHODS,
  SUPPLIER_MESSAGES,
  ChangeSupplierStatusDto,
  SupplierModel,
  buildSearchFilter,
} from '@mebike/common';
import { SupplierService } from './supllier.service';

@Controller()
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class SupplierController {
  private readonly baseHandler: BaseGrpcHandler<
    SupplierModel,
    CreateSupplierDto,
    UpdateSupplierDto
  >;

  constructor(private readonly supplierService: SupplierService) {
    this.baseHandler = new BaseGrpcHandler(
      this.supplierService,
      CreateSupplierDto,
      UpdateSupplierDto,
    );
  }

  @GrpcMethod(GRPC_SERVICES.FLEET, SUPPLIER_METHODS.UPDATE)
  async updateSupplier(
    data: UpdateSupplierDto & { id: string },
  ): Promise<ReturnType<typeof grpcResponse>> {
    try {
      const { id, address, phone, ...rest } = data;
      const currentSupplier = await this.baseHandler.getOneById(id);

      if (!currentSupplier) {
        throwGrpcError(404, SUPPLIER_MESSAGES.NOT_FOUND, [
          SUPPLIER_MESSAGES.NOT_FOUND,
        ]);
      }

      const oldContactInfo = (currentSupplier.contactInfo as any) || {};
      const newContactInfo = {
        ...oldContactInfo,
      };

      if (address) newContactInfo.address = address;
      if (phone) newContactInfo.phone = phone;

      const updateData: any = {
        ...rest,
        contactInfo: newContactInfo,
      };

      const result = await this.baseHandler.updateLogic(id, updateData);
      return grpcResponse<SupplierModel>(
        result,
        SUPPLIER_MESSAGES.UPDATE_SUCCESS,
      );
    } catch (error) {
      if (error instanceof RpcException) {
        throw error;
      }
      const err = error as Error;
      throw new RpcException(err?.message || SUPPLIER_MESSAGES.UPDATE_FAIL);
    }
  }

  @GrpcMethod(GRPC_SERVICES.FLEET, SUPPLIER_METHODS.GET_ONE)
  async getSupplierDetail({
    id,
  }: {
    id: string;
  }): Promise<ReturnType<typeof grpcResponse>> {
    try {
      const result = await prismaFleet.supplier.findUnique({
        where: { id },
        include: {
          bikes: {
            include: {
              station: true,
            },
          },
        },
      });
      if (!result) {
        throwGrpcError(404, SUPPLIER_MESSAGES.NOT_FOUND, [
          SUPPLIER_MESSAGES.NOT_FOUND,
        ]);
      }

      return grpcResponse<SupplierModel>(
        result as unknown as SupplierModel,
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
      const supplierData = {
        name: data.name,
        contactFee: data.contactFee,
        contactInfo: {
          address: data.address,
          phone: data.phone,
        },
      };
      const result = await this.baseHandler.createLogic(
        supplierData as unknown as CreateSupplierDto,
      );

      return grpcResponse<SupplierModel>(
        result,
        SUPPLIER_MESSAGES.CREATE_SUCCESS,
      );
    } catch (error: any) {
      if (error instanceof RpcException) {
        throw error;
      }
      const err = error as Error;
      throw new RpcException(err?.message || SUPPLIER_MESSAGES.CREATE_FAILED);
    }
  }

  @GrpcMethod(GRPC_SERVICES.FLEET, SUPPLIER_METHODS.GET_ALL)
  async getAllSuppliers(data: {
    page: number;
    limit: number;
    search?: string;
  }): Promise<ReturnType<typeof grpcPaginateResponse>> {
    try {
      const { page, limit } = data;
      const searchFilter = ['name', 'id'];
      const search = buildSearchFilter(data.search, searchFilter);

      const result = await this.baseHandler.getAllLogic(page, limit, search);
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
      const profile = await prismaFleet.supplier.update({
        where: { id },
        data: updatedData,
      });
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
  async getUserStats() {
    const result = await this.supplierService.getSupplierStat();
    return grpcResponse(result, SUPPLIER_MESSAGES.GET_ALL_STATS_SUCCESS);
  }

  @GrpcMethod(GRPC_SERVICES.FLEET, SUPPLIER_METHODS.GET_SUPPLIERS_BY_IDS)
  async getSupplierByIds(data: { ids: string[] }) {
    const result = await prismaFleet.supplier.findMany({
      where: {
        id: {
          in: data.ids,
        },
      },
    });
    return grpcResponse(result, SUPPLIER_MESSAGES.GET_ALL_SUCCESS);
  }
}
