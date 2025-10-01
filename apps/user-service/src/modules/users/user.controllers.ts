import { Controller } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import {
  BaseGrpcHandler,
  GRPC_SERVICES,
  grpcPaginateResponse,
  grpcResponse,
  SERVER_MESSAGE,
  throwGrpcError,
  USER_MESSAGES,
  USER_METHODS,
} from '@mebike/common';
import { User } from '@prisma/client';
import { UpdateUserDto } from './dto/UpdateUserDto';
import { UserService } from './user.services';
import * as bcrypt from 'bcrypt';

@Controller()
export class UserController {
  private readonly baseHandler: BaseGrpcHandler<User, never, UpdateUserDto>;

  constructor(private readonly userService: UserService) {
    this.baseHandler = new BaseGrpcHandler(
      this.userService,
      undefined,
      UpdateUserDto,
    );
  }

  @GrpcMethod(GRPC_SERVICES.USER, USER_METHODS.GET_ALL)
  async getAllUser(data: { page?: number; limit?: number }) {
    try {
      const page = data.page ?? 1;
      const limt = data.limit ?? 10;

      const result = await this.baseHandler.getAllLogic(page, limt);
      return grpcPaginateResponse(result, USER_MESSAGES.GET_ALL_SUCCESS);
    } catch (error) {
      const err = error as Error;
      throw new RpcException(err?.message || USER_MESSAGES.GET_ALL_FAIL);
    }
  }

  @GrpcMethod(GRPC_SERVICES.USER, USER_METHODS.UPDATE)
  async updateProfile(data: UpdateUserDto & { id: string }) {
    try {
      const { id, ...updateData } = data;

      const findUser = await this.baseHandler.getOneById(id);
      if (!findUser) {
        throwGrpcError(USER_MESSAGES.NOT_FOUND, [USER_MESSAGES.NOT_FOUND]);
      }

      const result = await this.baseHandler.updateLogic(id, updateData);
      return grpcResponse(result, USER_MESSAGES.UPDATE_SUCCESS);
    } catch (error) {
      const err = error as Error;
      throw new RpcException(err?.message || USER_MESSAGES.UPDATE_FAIL);
    }
  }

  @GrpcMethod(GRPC_SERVICES.USER, USER_METHODS.GET_ONE)
  async getUserDetail({ id }: { id: string }) {
    try {
      const result = await this.baseHandler.getOneById(id);
      if (!result) {
        throwGrpcError(USER_MESSAGES.NOT_FOUND, [USER_MESSAGES.NOT_FOUND]);
      }

      return grpcResponse(result, USER_MESSAGES.GET_DETAIL_SUCCESS);
    } catch (error) {
      const err = error as Error;
      throw new RpcException(err?.message || USER_MESSAGES.UPDATE_FAIL);
    }
  }

  @GrpcMethod(GRPC_SERVICES.USER, USER_METHODS.CHANGE_PASSWORD)
  async changePassword(data: { password: string; id: string }) {
    try {
      if (!data?.id) {
        throwGrpcError(SERVER_MESSAGE.BAD_REQUEST, [USER_MESSAGES.ID_REQUIRED]);
      }

      if (!data?.password) {
        throwGrpcError(SERVER_MESSAGE.BAD_REQUEST, [
          USER_MESSAGES.PASSWORD_REQUIRED,
        ]);
      }

      const findUser = await this.baseHandler.getOneById(data.id);
      if (!findUser) {
        throwGrpcError(USER_MESSAGES.NOT_FOUND, [USER_MESSAGES.NOT_FOUND]);
      }

      if (findUser.password.match(data?.password)) {
        throwGrpcError(SERVER_MESSAGE.BAD_REQUEST, [
          USER_MESSAGES.PASSWORRD_NOT_CHANGED,
        ]);
      }

      const hashPassword = bcrypt.hashSync(data.password, 10);
      const result = await this.userService.updatePassword(
        data.id,
        hashPassword,
      );

      return grpcResponse(result, USER_MESSAGES.UPDATE_SUCCESS);
    } catch (error) {
      const err = error as Error;
      throw new RpcException(err?.message || USER_MESSAGES.UPDATE_FAIL);
    }
  }
}
