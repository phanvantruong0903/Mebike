import {
  BaseGrpcHandler,
  Product,
  CreateProductDto,
  UpdateProductDto,
  GRPC_SERVICES,
  PRODUCT_METHODS,
  throwGrpcError,
  PRODUCT_MESSAGES,
  grpcResponse,
  grpcPaginateResponse,
  buildSearchFilter,
  ChangeProductStatusDto,
  prismaInventory,
  SERVER_MESSAGE,
} from '@loginex/common';
import { Controller, UsePipes, ValidationPipe } from '@nestjs/common';
import { ProductsService } from './products.service';
import { GrpcMethod, RpcException } from '@nestjs/microservices';

@Controller()
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class ProductsController {
  private readonly baseHandler: BaseGrpcHandler<
    Product,
    CreateProductDto,
    UpdateProductDto
  >;
  constructor(private readonly productsService: ProductsService) {
    this.baseHandler = new BaseGrpcHandler(
      this.productsService,
      CreateProductDto,
      UpdateProductDto,
    );
  }

  @GrpcMethod(GRPC_SERVICES.PRODUCT, PRODUCT_METHODS.CREATE)
  async createProduct(
    data: CreateProductDto,
  ): Promise<ReturnType<typeof grpcResponse<Product>>> {
    try {
      const volume = data.width * data.height * data.length;

      const payload = {
        ...data,
        volume,
      };

      const result = await this.baseHandler.createLogic(payload);

      return grpcResponse<Product>(result, PRODUCT_MESSAGES.CREATE_SCUCCESS);
    } catch (error) {
      if (error instanceof RpcException) {
        throw error;
      }
      const err = error as Error;
      throw new RpcException(err?.message || PRODUCT_MESSAGES.CREATE_FAILED);
    }
  }

  @GrpcMethod(GRPC_SERVICES.PRODUCT, PRODUCT_METHODS.UPDATE)
  async updateProduct(
    data: UpdateProductDto & { id: string },
  ): Promise<ReturnType<typeof grpcResponse<Product>>> {
    try {
      const { id, ...updateData } = data;

      const result = await this.baseHandler.updateLogic(id, updateData);

      return grpcResponse<Product>(result, PRODUCT_MESSAGES.UPDATE_SUCCESS);
    } catch (error) {
      if (error instanceof RpcException) {
        throw error;
      }
      const err = error as Error;
      throw new RpcException(err?.message || PRODUCT_MESSAGES.UPDATE_FAIL);
    }
  }

  @GrpcMethod(GRPC_SERVICES.PRODUCT, PRODUCT_METHODS.GET_ALL)
  async getAllProducts(data: {
    page: number;
    limit: number;
    search?: string;
  }): Promise<ReturnType<typeof grpcPaginateResponse<Product>>> {
    try {
      const { page, limit, search } = data;

      const searchFields = ['sku', 'name'];

      const searchFilter = buildSearchFilter(search, searchFields);

      const result = await this.baseHandler.getAllLogic(
        page,
        limit,
        searchFilter,
      );

      return grpcPaginateResponse<Product>(
        result,
        PRODUCT_MESSAGES.GET_ALL_SUCCESS,
      );
    } catch (error) {
      if (error instanceof RpcException) {
        throw error;
      }
      const err = error as Error;
      throw new RpcException(err?.message || PRODUCT_MESSAGES.GET_ALL_FAIL);
    }
  }

  @GrpcMethod(GRPC_SERVICES.PRODUCT, PRODUCT_METHODS.GET_DETAIL)
  async getProductDetail({
    id,
  }: {
    id: string;
  }): Promise<ReturnType<typeof grpcResponse<Product>>> {
    try {
      const result = await prismaInventory.product.findUnique({
        where: {
          id,
        },
      });
      if (!result) {
        throwGrpcError(PRODUCT_MESSAGES.NOT_FOUND, [
          PRODUCT_MESSAGES.NOT_FOUND,
        ]);
      }

      return grpcResponse<Product>(result, PRODUCT_MESSAGES.GET_DETAIL_SUCCESS);
    } catch (error) {
      if (error instanceof RpcException) {
        throw error;
      }
      const err = error as Error;
      throw new RpcException(err?.message || PRODUCT_MESSAGES.GET_DETAIL_FAIL);
    }
  }

  @GrpcMethod(GRPC_SERVICES.PRODUCT, PRODUCT_METHODS.CHANGE_STATUS)
  async changeStatus(
    data: ChangeProductStatusDto,
  ): Promise<ReturnType<typeof grpcResponse<Product>>> {
    try {
      const { id, ...updatedData } = data;
      const result = await prismaInventory.product.update({
        where: {
          id,
        },
        data: updatedData,
      });
      return grpcResponse<Product>(
        result,
        PRODUCT_MESSAGES.CHANGE_STATUS_SUCCESS,
      );
    } catch (error) {
      if (error instanceof RpcException) {
        throw error;
      }

      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        error.code === 'P2025'
      ) {
        throwGrpcError(SERVER_MESSAGE.NOT_FOUND, [PRODUCT_MESSAGES.NOT_FOUND]);
      }
      const err = error as Error;
      throw new RpcException(
        err?.message || PRODUCT_MESSAGES.CHANGE_STATUS_FAIL,
      );
    }
  }
}
