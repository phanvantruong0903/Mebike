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
  prismaUser,
  Profile,
  grpcPaginateResponse,
  UserProfile,
  KAFKA_TOPIC,
  ChangeUserStatusDto,
  SERVER_MESSAGE,
  buildSearchFilter,
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

      const result = await prismaUser.profile.update({
        where: { accountId: id },
        data: updateData,
      });
      return grpcResponse(result, USER_MESSAGES.UPDATE_SUCCESS);
    } catch (error: any) {
      if (error?.code === 'P2002') {
        const fields: string[] = error.meta?.target ?? [];
        const messages = fields.map((field) => {
          switch (field) {
            case 'email':
              return USER_MESSAGES.EMAIL_EXISTED;
            default:
              return `${field} existed`;
          }
        });
        throwGrpcError(409, SERVER_MESSAGE.UNIQUE_CONSTRAINT_FAILED, messages);
      }

      if (error?.code === 'P2003') {
        const field = error.meta?.field_name ?? 'relation';
        throwGrpcError(400, SERVER_MESSAGE.FOREIGN_KEY_FAILED, [
          SERVER_MESSAGE.FOREIGN_KEY_INVALID(field),
        ]);
      }

      if (error?.code === 'P2025') {
        throwGrpcError(404, USER_MESSAGES.NOT_FOUND, [USER_MESSAGES.NOT_FOUND]);
      }
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
      const result = await prismaUser.profile.findUnique({
        where: { accountId: id },
      });
      if (!result) {
        throwGrpcError(404, USER_MESSAGES.NOT_FOUND, [USER_MESSAGES.NOT_FOUND]);
      }

      return grpcResponse(result, USER_MESSAGES.GET_DETAIL_SUCCESS);
    } catch (error) {
      if (error instanceof RpcException) {
        throw error;
      }
      const err = error as Error;
      throw new RpcException(err?.message || USER_MESSAGES.UPDATE_FAIL);
    }
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
      const profile = await prismaUser.profile.update({
        where: { accountId },
        data: updatedData,
      });
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
}
