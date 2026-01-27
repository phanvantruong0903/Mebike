import { Controller, Inject, UsePipes, ValidationPipe } from '@nestjs/common';
import { ClientKafka, GrpcMethod, RpcException } from '@nestjs/microservices';
import type { ClientGrpc } from '@nestjs/microservices';
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
  LoginUserDto,
  CreateUserDto,
  User,
  ChangePasswordDto,
  KAFKA_SERVICE,
  KAFKA_TOPIC,
  RegisterUserDto,
  Role,
  ResetPasswordRequestDto,
  Account,
  REDIS_CONSTANTS,
  REDIS_KEY_PREFIX,
  ResetPasswordDto,
  prismaAuth,
  LogoutDto,
  UserVerifyStatus,
  VerifyEmailDto,
  GRPC_PACKAGE,
  STATION_MESSAGES,
  RefreshTokenDto,
  VerifyOtpDto,
  VerifyEmailRequestDto,
} from '@mebike/common';
import * as bcrypt from 'bcrypt';
import { Redis } from 'ioredis';
import { TemporalService } from '../../saga/temporal-service';
import { firstValueFrom, Observable } from 'rxjs';

interface FleetServiceClient {
  StationExist(data: {
    id: string;
  }): Observable<ReturnType<typeof grpcResponse<{ exists: boolean }>>>;
}

@Controller()
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class AuthGrpcController {
  private readonly baseHandler: BaseGrpcHandler<User, UserDto, never>;
  private readonly fleetService!: FleetServiceClient;

  constructor(
    @Inject(KAFKA_SERVICE.AUTH_SERVICE)
    private readonly kafkaClient: ClientKafka,
    @Inject(REDIS_CONSTANTS.REDIS_CLIENT)
    private readonly redis: Redis,
    private readonly authService: AuthService,
    private readonly temporalService: TemporalService,
    @Inject(GRPC_PACKAGE.FLEET) private readonly fleetClient: ClientGrpc,
  ) {
    this.baseHandler = new BaseGrpcHandler(this.authService, CreateUserDto);
    this.fleetService = this.fleetClient.getService<FleetServiceClient>(
      GRPC_SERVICES.FLEET,
    );
  }

  async checkStationExist(data: { id: string }): Promise<boolean> {
    const response = await firstValueFrom(
      this.fleetService.StationExist({ id: data.id }),
    );
    return (response.data as { exists: boolean }).exists;
  }

  @GrpcMethod(GRPC_SERVICES.AUTH, USER_METHODS.CREATE)
  async createUser(
    data: CreateUserDto,
  ): Promise<ReturnType<typeof grpcResponse>> {
    if (data.role !== Role.USER) {
      if (!data.workStationId) {
        throwGrpcError(400, SERVER_MESSAGE.BAD_REQUEST, [
          STATION_MESSAGES.NOT_FOUND,
        ]);
      }
      const stationExist = await this.checkStationExist({
        id: data.workStationId,
      });
      if (!stationExist) {
        throwGrpcError(400, SERVER_MESSAGE.BAD_REQUEST, [
          STATION_MESSAGES.NOT_FOUND,
        ]);
      }
    } else {
      data.workStationId = '';
    }

    return this._handleCreateUserLogic(data, data.role, false);
  }

  @GrpcMethod(GRPC_SERVICES.AUTH, USER_METHODS.REGISTER)
  async register(
    data: RegisterUserDto,
  ): Promise<ReturnType<typeof grpcResponse>> {
    return this._handleCreateUserLogic(data, Role.USER, true);
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
  async refreshToken(
    data: RefreshTokenDto,
  ): Promise<ReturnType<typeof grpcResponse>> {
    const { refreshToken, accessToken } = data;

    const result = await this.authService.refreshToken(
      refreshToken,
      accessToken,
    );
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

  @GrpcMethod(GRPC_SERVICES.AUTH, USER_METHODS.RESET_PASSWORD_REQUEST)
  async resetPasswordRequest(data: ResetPasswordRequestDto) {
    const user = await this.authService.getUserByEmail(data);

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    await this.redis.set(
      `${REDIS_KEY_PREFIX.PASSWORD_RESET}:${user.email}`,
      otpCode,
      'EX',
      300,
    );

    const account = user as Account;

    this.kafkaClient
      .emit(KAFKA_TOPIC.USER_RESET_PASSWORD, {
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
      })
      .subscribe();

    return grpcResponse(null, USER_MESSAGES.RESET_PASSWORD_OTP_SENT);
  }

  @GrpcMethod(GRPC_SERVICES.AUTH, USER_METHODS.VERIFY_OTP)
  async verifyOtp(
    data: VerifyOtpDto,
  ): Promise<ReturnType<typeof grpcResponse>> {
    try {
      const { email, otp } = data;
      const storedOtp = await this.redis.get(
        `${REDIS_KEY_PREFIX.PASSWORD_RESET}:${email}`,
      );

      if (storedOtp !== otp) {
        throwGrpcError(401, SERVER_MESSAGE.UNAUTHORIZED, [
          USER_MESSAGES.INVALID_OTP,
        ]);
      }

      const deleted = this.redis.del(
        `${REDIS_KEY_PREFIX.PASSWORD_RESET}:${email}`,
      );

      const verifyResult = this.authService.verifyOtpSuccess(email);

      const [finalResult] = await Promise.all([verifyResult, deleted]);
      return grpcResponse(
        { resetToken: finalResult },
        USER_MESSAGES.OTP_VERIFIED_SUCCESS,
      );
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
    const user = await this.authService.resetPassword(data);
    return grpcResponse(user, USER_MESSAGES.PASSWORD_RESET_SUCCESS);
  }

  private async _handleCreateUserLogic(
    data: RegisterUserDto | CreateUserDto,
    role: Role,
    shouldGenerateToken: boolean,
  ): Promise<ReturnType<typeof grpcResponse>> {
    let user: User | null = null;
    try {
      let rawPassword = '';
      let isFirstLogin = false;

      if (role === Role.USER && 'password' in data) {
        if (data.password !== data.confirmPassword) {
          throwGrpcError(400, SERVER_MESSAGE.BAD_REQUEST, [
            USER_MESSAGES.PASSWORD_NOT_MATCH,
          ]);
        }
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

      await this.temporalService.startUserCreationWorkflow({
        accountId: user.id,
        role,
        email: data.email,
        name: data.name,
        phone: data.phone,
        YOB: data.YOB,
        workStationId:
          'workStationId' in data && data.workStationId
            ? data.workStationId
            : undefined,
      });

      if (shouldGenerateToken) {
        const { accessToken, refreshToken } =
          await this.authService.generateToken({
            user_id: user.id,
            role: role,
            verify: UserVerifyStatus.Unverified,
            workStationId:
              'workStationId' in data && data.workStationId
                ? data.workStationId
                : undefined,
          });

        return grpcResponse(
          { accessToken, refreshToken, id: user.id },
          USER_MESSAGES.CREATE_SCUCCESS,
        );
      }

      return grpcResponse(user, USER_MESSAGES.CREATE_SCUCCESS);
    } catch (error) {
      if (user) {
        await this.baseHandler.deleteLogic(user.id);
      }
      if (error instanceof RpcException) {
        throw error;
      }
      const err = error as Error;
      throwGrpcError(400, err?.message || USER_MESSAGES.CREATE_FAILED, [
        err.message,
      ]);
    }
  }

  @GrpcMethod(GRPC_SERVICES.AUTH, USER_METHODS.GET_ACCOUNT_BY_ACCOUNT_ID)
  async getAccountByAccountIds(data: {
    ids: string[];
  }): Promise<ReturnType<typeof grpcResponse>> {
    const { ids } = data;
    const accounts = await prismaAuth.user.findMany({
      where: { id: { in: ids } },
    });
    return grpcResponse(accounts, USER_MESSAGES.GET_DETAIL_SUCCESS);
  }

  @GrpcMethod(GRPC_SERVICES.AUTH, USER_METHODS.LOGOUT)
  async logout(data: LogoutDto): Promise<ReturnType<typeof grpcResponse>> {
    const { accessToken, refreshToken } = data;
    await this.authService.logout(accessToken, refreshToken);
    return grpcResponse(null, USER_MESSAGES.LOGOUT_SUCCESS);
  }

  @GrpcMethod(GRPC_SERVICES.AUTH, USER_METHODS.VERIFY_EMAIL)
  async verifyEmail(
    data: VerifyEmailRequestDto,
  ): Promise<ReturnType<typeof grpcResponse>> {
    const { accountId } = data;

    try {
      await this.authService.verifyEmail(accountId);
      return grpcResponse(null, USER_MESSAGES.RESET_PASSWORD_OTP_SENT);
    } catch (error) {
      if (error instanceof RpcException) {
        throw error;
      }
      const err = error as Error;
      throw new RpcException(err?.message);
    }
  }

  @GrpcMethod(GRPC_SERVICES.AUTH, USER_METHODS.VERIFY_EMAIL_PROCESS)
  async verifyEmailProcess(
    data: VerifyEmailDto,
  ): Promise<ReturnType<typeof grpcResponse>> {
    try {
      await this.authService.verifyEmailOtp(data);
      return grpcResponse(null, USER_MESSAGES.OTP_VERIFIED_SUCCESS);
    } catch (error) {
      if (error instanceof RpcException) {
        throw error;
      }
      const err = error as Error;
      throw new RpcException(err?.message);
    }
  }
}
