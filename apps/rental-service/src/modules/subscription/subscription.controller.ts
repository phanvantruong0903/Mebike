import { Controller, UsePipes, ValidationPipe } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import {
  BaseGrpcHandler,
  buildFilter,
  buildSearchFilter,
  CreateSubscriptionDto,
  GetSubscriptionListDto,
  GRPC_SERVICES,
  grpcPaginateResponse,
  grpcResponse,
  SUBSCRIPTION_MESSAGES,
  SUBSCRIPTION_METHODS,
  SubscriptionModel,
} from '@mebike/common';

@Controller()
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class SubscriptionController {
  private readonly baseHandler: BaseGrpcHandler<
    SubscriptionModel,
    CreateSubscriptionDto
  >;
  constructor(private readonly subscriptionService: SubscriptionService) {
    this.baseHandler = new BaseGrpcHandler(
      this.subscriptionService,
      CreateSubscriptionDto,
    );
  }

  @GrpcMethod(GRPC_SERVICES.RENTAL, SUBSCRIPTION_METHODS.CREATE)
  async createSubscription(
    data: CreateSubscriptionDto,
  ): Promise<ReturnType<typeof grpcResponse>> {
    try {
      const result = await this.subscriptionService.create(data);

      return grpcResponse<SubscriptionModel>(
        result,
        SUBSCRIPTION_MESSAGES.CREATE_SUCCESS,
      );
    } catch (error) {
      if (error instanceof RpcException) {
        throw error;
      }
      const err = error as Error;
      console.log(err);
      throw new RpcException(
        err?.message || SUBSCRIPTION_MESSAGES.CREATE_FAILED,
      );
    }
  }

  @GrpcMethod(GRPC_SERVICES.RENTAL, SUBSCRIPTION_METHODS.GET_ONE)
  async getSubscription({
    id,
  }: {
    id: string;
  }): Promise<ReturnType<typeof grpcResponse>> {
    try {
      const result = await this.baseHandler.getOneById(id);

      if (!result) {
        throw new RpcException(SUBSCRIPTION_MESSAGES.NOT_FOUND);
      }

      return grpcResponse<SubscriptionModel>(
        result,
        SUBSCRIPTION_MESSAGES.GET_ONE_SUCCESS,
      );
    } catch (error) {
      if (error instanceof RpcException) {
        throw error;
      }
      const err = error as Error;
      throw new RpcException(
        err?.message || SUBSCRIPTION_MESSAGES.GET_ONE_FAILED,
      );
    }
  }

  @GrpcMethod(GRPC_SERVICES.RENTAL, SUBSCRIPTION_METHODS.GET_ALL)
  async getAllSubscription(
    data: GetSubscriptionListDto,
  ): Promise<ReturnType<typeof grpcPaginateResponse>> {
    try {
      const { page, limit, search, ...filterFields } = data;
      const filter = buildFilter(filterFields);

      const searchFields = ['userId', 'status'];
      const searchFilter = buildSearchFilter(search, searchFields);

      const where = {
        ...filter,
        ...searchFilter,
      };

      const result = await this.baseHandler.getAllLogic(page, limit, where);
      return grpcPaginateResponse(
        result,
        SUBSCRIPTION_MESSAGES.GET_ALL_SUCCESS,
      );
    } catch (error) {
      if (error instanceof RpcException) {
        throw error;
      }
      const err = error as Error;
      throw new RpcException(
        err?.message || SUBSCRIPTION_MESSAGES.GET_ALL_FAIL,
      );
    }
  }

  @GrpcMethod(GRPC_SERVICES.RENTAL, SUBSCRIPTION_METHODS.ACTIVATE)
  async activateSubscription({
    id,
  }: {
    id: string;
  }): Promise<ReturnType<typeof grpcResponse>> {
    try {
      const result = await this.subscriptionService.activate(id);

      if (!result) {
        throw new RpcException(SUBSCRIPTION_MESSAGES.NOT_FOUND);
      }

      return grpcResponse<SubscriptionModel>(
        result,
        SUBSCRIPTION_MESSAGES.ACTIVATE_SUCCESS,
      );
    } catch (error) {
      if (error instanceof RpcException) {
        throw error;
      }
      const err = error as Error;
      throw new RpcException(
        err?.message || SUBSCRIPTION_MESSAGES.ACTIVATE_FAILED,
      );
    }
  }

  @GrpcMethod(GRPC_SERVICES.RENTAL, SUBSCRIPTION_METHODS.EXPIRE)
  async expireSubscription({
    id,
  }: {
    id: string;
  }): Promise<ReturnType<typeof grpcResponse>> {
    try {
      const result = await this.subscriptionService.expire(id);

      if (!result) {
        throw new RpcException(SUBSCRIPTION_MESSAGES.NOT_FOUND);
      }

      return grpcResponse<SubscriptionModel>(
        result,
        SUBSCRIPTION_MESSAGES.EXPIRE_SUCCESS,
      );
    } catch (error) {
      if (error instanceof RpcException) {
        throw error;
      }
      const err = error as Error;
      throw new RpcException(
        err?.message || SUBSCRIPTION_MESSAGES.EXPIRE_FAILED,
      );
    }
  }
}
