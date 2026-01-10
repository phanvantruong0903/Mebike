import { Controller, UsePipes, ValidationPipe } from '@nestjs/common';
import {
  EventPattern,
  GrpcMethod,
  Payload,
  RpcException,
} from '@nestjs/microservices';
import {
  BaseGrpcHandler,
  CreateProfileDto,
  GRPC_SERVICES,
  grpcResponse,
  throwGrpcError,
  USER_MESSAGES,
  USER_METHODS,
  UpdateProfileDto,
  Profile,
  grpcPaginateResponse,
  ChangeUserStatusDto,
  SERVER_MESSAGE,
  buildSearchFilter,
  KAFKA_TOPIC,
} from '@mebike/common';
import { UserService } from './user.services';

@Controller()
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class UserController {
  private readonly baseHandler: BaseGrpcHandler<
    Profile,
    CreateProfileDto,
    UpdateProfileDto
  >;

  constructor(private readonly userService: UserService) {
    this.baseHandler = new BaseGrpcHandler(
      this.userService,
      CreateProfileDto,
      UpdateProfileDto,
    );
  }

  @GrpcMethod(GRPC_SERVICES.USER, USER_METHODS.UPDATE)
  async updateProfile(
    data: UpdateProfileDto,
  ): Promise<ReturnType<typeof grpcResponse>> {
    try {
      const { id, ...updateData } = data;
      const result = await this.userService.updateProfile(
        id,
        updateData as Omit<UpdateProfileDto, 'id'>,
      );
      return grpcResponse(result, USER_MESSAGES.UPDATE_SUCCESS);
    } catch (error: any) {
      if (error instanceof RpcException) {
        throw error;
      }
      const err = error as Error;
      throw new RpcException(err?.message || USER_MESSAGES.UPDATE_FAIL);
    }
  }

  @GrpcMethod(GRPC_SERVICES.USER, USER_METHODS.GET_ONE)
  async getUserDetail({
    id,
  }: {
    id: string;
  }): Promise<ReturnType<typeof grpcResponse>> {
    try {
      const result = await this.userService.getUserDetail(id);
      return grpcResponse(result, USER_MESSAGES.GET_DETAIL_SUCCESS);
    } catch (error) {
      if (error instanceof RpcException) {
        throw error;
      }
      const err = error as Error;
      throw new RpcException(err?.message || USER_MESSAGES.UPDATE_FAIL);
    }
  }

  @GrpcMethod(GRPC_SERVICES.USER, USER_METHODS.CREATE)
  async createUser(
    data: CreateProfileDto,
  ): Promise<ReturnType<typeof grpcResponse>> {
    try {
      const profile = await this.baseHandler.createLogic(data);
      return grpcResponse(profile, USER_MESSAGES.CREATE_SCUCCESS);
    } catch (error) {
      if (error instanceof RpcException) {
        throw error;
      }
      const err = error as Error;
      throwGrpcError(400, err?.message || USER_MESSAGES.CREATE_FAILED, [
        err.message,
      ]);
    }
  }

  @GrpcMethod(GRPC_SERVICES.USER, USER_METHODS.DELETE)
  async deleteUser(data: {
    accountId: string;
  }): Promise<ReturnType<typeof grpcResponse>> {
    try {
      await this.userService.deleteUser(data.accountId);
      return grpcResponse(null, USER_MESSAGES.DELETE_SUCCESS);
    } catch (error: any) {
      if (error instanceof RpcException) {
        throw error;
      }
      const err = error as Error;
      throwGrpcError(400, err?.message || USER_MESSAGES.DELETE_FAILED, [
        err.message,
      ]);
    }
  }

  @GrpcMethod(GRPC_SERVICES.USER, USER_METHODS.GET_ALL)
  async getAllUsers(data: {
    page: number;
    limit: number;
    search?: string;
  }): Promise<ReturnType<typeof grpcPaginateResponse>> {
    try {
      const { page, limit } = data;

      const searchFields = ['name', 'phone'];
      const searchFilter = buildSearchFilter(data.search, searchFields);

      const result = await this.baseHandler.getAllLogic(
        page,
        limit,
        searchFilter,
      );
      return grpcPaginateResponse(result, USER_MESSAGES.GET_ALL_SUCCESS);
    } catch (error) {
      if (error instanceof RpcException) {
        throw error;
      }
      const err = error as Error;
      throw new RpcException(err?.message || USER_MESSAGES.GET_ALL_FAILED);
    }
  }

  @GrpcMethod(GRPC_SERVICES.USER, USER_METHODS.CHANGE_STATUS)
  async changeStatus(
    data: ChangeUserStatusDto,
  ): Promise<ReturnType<typeof grpcResponse>> {
    try {
      const { accountId, ...updatedData } = data;
      const profile = await this.userService.changeUserStatus(
        accountId,
        updatedData.status,
      );
      return grpcResponse(profile, USER_MESSAGES.UPDATE_SUCCESS);
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
          USER_MESSAGES.NOT_FOUND,
        ]);
      }
      const err = error as Error;
      throw new RpcException(err?.message);
    }
  }

  @GrpcMethod(GRPC_SERVICES.USER, USER_METHODS.GET_STATS)
  async getUserStats() {
    const result = await this.userService.getUserStat();
    return grpcResponse(result, USER_MESSAGES.GET_ALL_STATS_SUCCESS);
  }

  @GrpcMethod(GRPC_SERVICES.USER, USER_METHODS.USER_VERIFY)
  async userVerify(data: { accountId: string }) {
    const result = await this.userService.userVerify(data);
    return grpcResponse(result, USER_MESSAGES.USER_VERIFY_SUCCESS);
  }

  @EventPattern(KAFKA_TOPIC.USER_CREATED)
  async createProfile(@Payload() data: any): Promise<Profile> {
    try {
      const profileData = data.value || data;
      const profile = await this.baseHandler.createLogic(profileData);

      return profile;
    } catch (error) {
      if (error instanceof RpcException) {
        throw error;
      }
      const err = error as Error;
      throw new RpcException(err?.message || USER_MESSAGES.CREATE_FAILED);
    }
  }

  @GrpcMethod(GRPC_SERVICES.USER, USER_METHODS.FIND_FREE_SOS)
  async findFreeSos(data: { stationId: string }) {
    const result = await this.userService.findFreeSos(data.stationId);
    return grpcResponse(result, USER_MESSAGES.FIND_FREE_SOS_SUCCESS);
  }
}
