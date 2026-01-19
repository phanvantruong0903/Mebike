import { Controller, UsePipes, ValidationPipe } from '@nestjs/common';
import { PackageService } from './package.service';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import {
  BaseGrpcHandler,
  buildFilter,
  buildSearchFilter,
  CreatePackageDto,
  GetPackageListDto,
  GRPC_SERVICES,
  grpcPaginateResponse,
  grpcResponse,
  PACKAGE_MESSAGES,
  PACKAGE_METHODS,
  PackageModel,
  UpdatePackageDto,
} from '@mebike/common';

@Controller()
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class PackageController {
  private readonly baseHandler: BaseGrpcHandler<
    PackageModel,
    CreatePackageDto,
    UpdatePackageDto
  >;
  constructor(private readonly packageService: PackageService) {
    this.baseHandler = new BaseGrpcHandler(
      this.packageService,
      CreatePackageDto,
      UpdatePackageDto,
    );
  }

  @GrpcMethod(GRPC_SERVICES.MEMBERSHIP, PACKAGE_METHODS.CREATE)
  async createPackage(
    data: CreatePackageDto,
  ): Promise<ReturnType<typeof grpcResponse>> {
    try {
      const result = await this.baseHandler.createLogic(data);

      return grpcResponse<PackageModel>(
        result,
        PACKAGE_MESSAGES.CREATE_SUCCESS,
      );
    } catch (error) {
      if (error instanceof RpcException) {
        throw error;
      }
      const err = error as Error;
      throw new RpcException(err?.message || PACKAGE_MESSAGES.CREATE_FAILED);
    }
  }

  @GrpcMethod(GRPC_SERVICES.MEMBERSHIP, PACKAGE_METHODS.UPDATE)
  async updatePackage(
    data: UpdatePackageDto & { id: string },
  ): Promise<ReturnType<typeof grpcResponse>> {
    try {
      const result = await this.baseHandler.updateLogic(data?.id, data);

      return grpcResponse<PackageModel>(
        result,
        PACKAGE_MESSAGES.UPDATE_SUCCESS,
      );
    } catch (error) {
      if (error instanceof RpcException) {
        throw error;
      }
      const err = error as Error;
      throw new RpcException(err?.message || PACKAGE_MESSAGES.UPDATE_FAIL);
    }
  }

  @GrpcMethod(GRPC_SERVICES.MEMBERSHIP, PACKAGE_METHODS.GET_ONE)
  async getPackage({
    id,
  }: {
    id: string;
  }): Promise<ReturnType<typeof grpcResponse>> {
    try {
      const result = await this.baseHandler.getOneById(id);

      if (!result) {
        throw new RpcException(PACKAGE_MESSAGES.NOT_FOUND);
      }

      return grpcResponse<PackageModel>(
        result,
        PACKAGE_MESSAGES.GET_ONE_SUCCESS,
      );
    } catch (error) {
      if (error instanceof RpcException) {
        throw error;
      }
      const err = error as Error;
      throw new RpcException(err?.message || PACKAGE_MESSAGES.GET_ONE_FAILED);
    }
  }

  @GrpcMethod(GRPC_SERVICES.MEMBERSHIP, PACKAGE_METHODS.GET_ALL)
  async getAllPackages(
    data: GetPackageListDto,
  ): Promise<ReturnType<typeof grpcPaginateResponse>> {
    try {
      const { page, limit, search, ...filterFields } = data;
      const filter = buildFilter(filterFields);

      const searchFields = ['name'];
      const searchFilter = buildSearchFilter(search, searchFields);

      const where = {
        ...filter,
        ...searchFilter,
      };

      const result = await this.baseHandler.getAllLogic(page, limit, where);
      return grpcPaginateResponse(result, PACKAGE_MESSAGES.GET_ALL_SUCCESS);
    } catch (error) {
      if (error instanceof RpcException) {
        throw error;
      }
      const err = error as Error;
      throw new RpcException(err?.message || PACKAGE_MESSAGES.GET_ALL_FAIL);
    }
  }
}
