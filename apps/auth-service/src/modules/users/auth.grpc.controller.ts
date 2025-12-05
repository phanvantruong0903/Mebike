import { Controller, Inject, UsePipes, ValidationPipe } from '@nestjs/common';
import { ClientKafka, GrpcMethod, RpcException } from '@nestjs/microservices';
import { AuthService } from './auth.service';
import {
  BaseGrpcHandler,
  SERVER_MESSAGE,
  throwGrpcError,
  GRPC_SERVICES,
  USER_METHODS,
  grpcResponse,
  USER_MESSAGES,
  UserDto,
  CreateProfileDto,
  LoginUserDto,
  CreateUserDto,
  User,
  ChangePasswordDto,
  KAFKA_SERVICE,
  KAFKA_TOPIC,
  RegisterUserDto,
  Role,
  ResetPasswordDto,
  Account,
  REDIS_CONSTANTS,
  REDIS_KEY_PREFIX,
} from '@mebike/common';
import * as bcrypt from 'bcrypt';
import { Redis } from 'ioredis';
import { lastValueFrom } from 'rxjs';

@Controller()
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class AuthGrpcController {
  private readonly baseHandler: BaseGrpcHandler<User, UserDto, never>;

  constructor(
    @Inject(KAFKA_SERVICE.AUTH_SERVICE)
    private readonly kafkaClient: ClientKafka,
    @Inject(REDIS_CONSTANTS.REDIS_CLIENT)
    private readonly redis: Redis,
    private readonly authService: AuthService,
  ) {
    this.baseHandler = new BaseGrpcHandler(this.authService, CreateUserDto);
  }

  @GrpcMethod(GRPC_SERVICES.AUTH, USER_METHODS.CREATE)
  async createUser(
    data: CreateUserDto,
  ): Promise<ReturnType<typeof grpcResponse>> {
    return this._handleCreateUserLogic(data, data.role);
  }

  @GrpcMethod(GRPC_SERVICES.AUTH, USER_METHODS.REGISTER)
  async register(
    data: RegisterUserDto,
  ): Promise<ReturnType<typeof grpcResponse>> {
    return this._handleCreateUserLogic(data, Role.USER);
  }

  @GrpcMethod(GRPC_SERVICES.AUTH, USER_METHODS.LOGIN)
  async login(data: LoginUserDto): Promise<ReturnType<typeof grpcResponse>> {
    const result = await this.authService.validateUser(data);

    const { accessToken, refreshToken } = await this.authService.generateToken(
      result,
    );

    return grpcResponse(
      { accessToken, refreshToken },
      USER_MESSAGES.LOGIN_SUCCESS,
    );
  }

  @GrpcMethod(GRPC_SERVICES.AUTH, USER_METHODS.REFRESH_TOKEN)
  async refreshToken(data: {
    refreshToken: string;
  }): Promise<ReturnType<typeof grpcResponse>> {
    const { refreshToken } = data;

    if (!refreshToken) {
      throwGrpcError(SERVER_MESSAGE.BAD_REQUEST, [
        USER_MESSAGES.REFRESH_TOKEN_REQUIRED,
      ]);
    }

    const result = await this.authService.refreshToken(refreshToken);
    return grpcResponse(result, USER_MESSAGES.REFRESH_TOKEN_SUCCESSFULLY);
  }

  @GrpcMethod(GRPC_SERVICES.AUTH, USER_METHODS.CHANGE_PASSWORD)
  async changePassword(data: ChangePasswordDto) {
    try {
      const user = await this.authService.changePassword(data);
      return grpcResponse(user, USER_MESSAGES.CHANGE_PASSWORD_SUCCESS);
    } catch (error) {
      if (error instanceof RpcException) {
        throw error;
      }
      const err = error as Error;
      throw new RpcException(err?.message);
    }
  }

  @GrpcMethod(GRPC_SERVICES.AUTH, USER_METHODS.RESET_PASSWORD)
  async resetPassword(data: ResetPasswordDto) {
    const user = await this.authService.getUserByEmail(data);

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    await this.redis.set(
      `${REDIS_KEY_PREFIX.PASSWORD_RESET}:${user.email}`,
      otpCode,
      'EX',
      300,
    );

    const account = user as Account;

    await lastValueFrom(
      this.kafkaClient.emit(KAFKA_TOPIC.USER_RESET_PASSWORD, {
        key: account.id,
        value: {
          to: account?.email,
          subject: 'OTP verification code',
          template: 'reset-password',
          data: {
            email: account?.email,
            otp: otpCode,
          },
        },
      }),
    );

    return grpcResponse(null, USER_MESSAGES.RESET_PASSWORD_OTP_SENT);
  }

  @GrpcMethod(GRPC_SERVICES.AUTH, USER_METHODS.VERIFY_OTP)
  async verifyOtp(data: {
    email: string;
    otp: string;
  }): Promise<ReturnType<typeof grpcResponse>> {
    try {
      const { email, otp } = data;
      const storedOtp = await this.redis.get(
        `${REDIS_KEY_PREFIX.PASSWORD_RESET}:${email}`,
      );

      if (storedOtp !== otp) {
        throwGrpcError(SERVER_MESSAGE.UNAUTHORIZED, [
          USER_MESSAGES.INVALID_OTP,
        ]);
      }

      const deleted = this.redis.del(
        `${REDIS_KEY_PREFIX.PASSWORD_RESET}:${email}`,
      );

      const verify = this.authService.verifyOtpSuccess(email);

      await Promise.all([deleted, verify]);

      return grpcResponse(null, USER_MESSAGES.OTP_VERIFIED_SUCCESS);
    } catch (error) {
      if (error instanceof RpcException) {
        throw error;
      }
      const err = error as Error;
      throw new RpcException(err?.message);
    }
  }

  private async _handleCreateUserLogic(
    data: RegisterUserDto | CreateUserDto,
    role: Role,
  ): Promise<ReturnType<typeof grpcResponse>> {
    let user: User | null = null;
    try {
      let rawPassword = '';
      let isFirstLogin = false;

      if (role === Role.USER && 'password' in data) {
        rawPassword = data.password;
      } else {
        rawPassword =
          process.env.DEFAULT_USER_PASSWORD || 'default_user_password';
        isFirstLogin = true;
      }

      // Step 1: Create User Account Record
      const hashPassword = await bcrypt.hash(rawPassword, 10);

      const userData: UserDto = {
        email: data.email,
        password: hashPassword,
        isFirstLogin,
      };

      user = await this.baseHandler.createLogic(userData);

      // Step 2: Create User Profile Record
      const profileData: CreateProfileDto = {
        YOB: data.YOB,
        name: data.name,
        accountId: user.id,
        role: role,
      };

      this.kafkaClient.emit(KAFKA_TOPIC.USER_CREATED, {
        key: user.id,
        value: profileData,
      });

      return grpcResponse(user, USER_MESSAGES.CREATE_SCUCCESS);
    } catch (error) {
      if (error instanceof RpcException) {
        throw error;
      }
      const err = error as Error;
      throwGrpcError(err?.message || USER_MESSAGES.CREATE_FAILED, [
        err.message,
      ]);
    }
  }
}
