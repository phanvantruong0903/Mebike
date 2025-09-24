import { Controller } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { UserService } from './users.service';
import { CreateUserDto } from './dto/CreateUserDto';
import { UpdateUserDto } from './dto/UpdateUserDto';
import { BaseGrpcHandler, throwGrpcError } from '@Mebike/common';
import { grpcResponse } from '@Mebike/common';
import { User } from '@prisma/client';
import { USER_MESSAGES } from '@Mebike/common';
import { LoginUserDto } from './dto/LoginUserDto';
import { GRPC_SERVICES, USER_METHODS } from '@Mebike/common';
import * as bcrypt from 'bcrypt';

@Controller()
export class UsersGrpcController {
  private readonly baseHandler: BaseGrpcHandler<
    User,
    CreateUserDto,
    UpdateUserDto
  >;

  constructor(private readonly userService: UserService) {
    this.baseHandler = new BaseGrpcHandler(
      this.userService,
      CreateUserDto,
      UpdateUserDto
    );
  }

  @GrpcMethod(GRPC_SERVICES.USER, USER_METHODS.CREATE)
  async createUser(data: CreateUserDto) {
    try {
      const hashPassword = bcrypt.hashSync(data.password, 10);

      const userData = { ...data, password: hashPassword };

      const result = await this.baseHandler.createLogic(userData);
      return grpcResponse(result, USER_MESSAGES.CREATE_SCUCCESS);
    } catch (error) {
      const err = error as Error;
      throw new RpcException(err?.message || USER_MESSAGES.CREATE_FAILED);
    }
  }

  @GrpcMethod(GRPC_SERVICES.USER, USER_METHODS.GET_ONE)
  async getUser({ id }: { id: string }) {
    const result = await this.baseHandler.getOneById(id);
    if (!result) {
      throwGrpcError(USER_MESSAGES.NOT_FOUND, [USER_MESSAGES.NOT_FOUND]);
    }

    return grpcResponse(result, USER_MESSAGES.GET_DETAIL_SUCCESS);
  }

  @GrpcMethod(GRPC_SERVICES.USER, USER_METHODS.UPDATE)
  async updateUser(data: UpdateUserDto & { id: string }) {
    const { id, ...updateData } = data;

    const findUser = await this.baseHandler.getOneById(id);
    if (!findUser) {
      throwGrpcError(USER_MESSAGES.NOT_FOUND, [USER_MESSAGES.NOT_FOUND]);
    }

    const result = await this.baseHandler.updateLogic(id, updateData);
    return grpcResponse(result, USER_MESSAGES.UPDATE_SUCCESS);
  }

  @GrpcMethod(GRPC_SERVICES.USER, USER_METHODS.GET_ALL)
  async getAllUsers(_data: object) {
    const result = await this.baseHandler.getAllLogic();
    return grpcResponse(result, USER_MESSAGES.GET_ALL_SUCCESS);
  }

  @GrpcMethod(GRPC_SERVICES.USER, USER_METHODS.LOGIN)
  async login(data: LoginUserDto) {
    const result = await this.userService.validateUser(data);
    return grpcResponse(result, USER_MESSAGES.LOGIN_SUCCESS);
  }
}
