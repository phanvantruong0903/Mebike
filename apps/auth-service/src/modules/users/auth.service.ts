import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import {
  BaseService,
  GRPC_PACKAGE,
  GRPC_SERVICES,
  JwtServiceCustom,
  SERVER_MESSAGE,
  TokenPayload,
  USER_MESSAGES,
  UserProfile,
  UserResponse,
  throwGrpcError,
  CreateUserDto,
  LoginUserDto,
  prismaAuth,
  User,
  ChangePasswordDto,
  UserStatus,
  REDIS_CONSTANTS,
  REDIS_KEY_PREFIX,
  ResetPasswordDto,
  KAFKA_TOPIC,
  KAFKA_SERVICE,
  VerifyEmailDto,
} from '@mebike/common';
import * as bcrypt from 'bcrypt';
import { RpcException } from '@nestjs/microservices';
import type { ClientGrpc, ClientKafka } from '@nestjs/microservices';
import { firstValueFrom, Observable } from 'rxjs';
import { Redis } from 'ioredis';

interface UserServiceClient {
  GetUser(data: { id: string }): Observable<UserResponse>;
  UserVerify(data: { accountId: string }): Observable<UserResponse>;
}
@Injectable()
export class AuthService
  extends BaseService<User, CreateUserDto, never>
  implements OnModuleInit
{
  private userService!: UserServiceClient;

  constructor(
    private readonly jwtService: JwtServiceCustom,
    @Inject(GRPC_PACKAGE.USER) private readonly client: ClientGrpc,
    @Inject(REDIS_CONSTANTS.REDIS_CLIENT) private readonly redisClient: Redis,
    @Inject(KAFKA_SERVICE.AUTH_SERVICE)
    private readonly kafkaClient: ClientKafka,
  ) {
    super(prismaAuth.user);
  }

  onModuleInit() {
    this.userService = this.client.getService<UserServiceClient>(
      GRPC_SERVICES.USER,
    );
  }

  async validateUser(data: LoginUserDto): Promise<TokenPayload> {
    try {
      const findUserPromise = prismaAuth.user.findUnique({
        where: { email: data.email },
        select: {
          id: true,
          password: true,
          isFirstLogin: true,
        },
      });

      const findUser = await findUserPromise;

      if (!findUser) {
        throwGrpcError(404, SERVER_MESSAGE.NOT_FOUND, [
          USER_MESSAGES.VALIDATION_FAILED,
        ]);
      }

      if (findUser.isFirstLogin === true) {
        throwGrpcError(400, SERVER_MESSAGE.NOT_FOUND, [
          USER_MESSAGES.USER_FIRST_LOGIN,
        ]);
      }

      const [isMatch, userProfile] = await Promise.all([
        bcrypt.compare(data.password, findUser.password),
        this.getUserProfile(findUser.id),
      ]);

      if (!isMatch) {
        throwGrpcError(404, SERVER_MESSAGE.NOT_FOUND, [
          USER_MESSAGES.VALIDATION_FAILED,
        ]);
      }

      const userData = userProfile.data as UserProfile;

      if (userData.status !== UserStatus.Active) {
        throwGrpcError(400, USER_MESSAGES.USER_STATUS_INVALID, [
          USER_MESSAGES.USER_STATUS_INVALID,
        ]);
      }

      return {
        user_id: userData.accountId,
        verify: userData.verify,
        role: userData.role,
      };
    } catch (error: unknown) {
      if (error instanceof RpcException) {
        throw error;
      }
      const err = error as Error;
      throwGrpcError(500, SERVER_MESSAGE.INTERNAL_SERVER, [err?.message]);
    }
  }

  async getUserById(id: string) {
    return await firstValueFrom(this.userService.GetUser({ id }));
  }

  async generateToken(payload: TokenPayload) {
    const [accessToken, refreshToken] = await Promise.all([
      this.signAcessToken(payload),
      this.signRefreshToken(payload),
    ]);

    const pipeline = this.redisClient.pipeline();

    pipeline.set(
      `${REDIS_KEY_PREFIX.ACCESS_TOKEN}:${accessToken}`,
      payload.user_id,
      'EX',
      Number(process.env.JWT_ACCESS_EXPIRATION_TIME) || 900,
    );

    pipeline.set(
      `${REDIS_KEY_PREFIX.REFRESH_TOKEN}:${refreshToken}`,
      payload.user_id,
      'EX',
      Number(process.env.JWT_REFRESH_EXPIRATION_TIME) || 604800,
    );

    await pipeline.exec();
    return { accessToken, refreshToken };
  }

  async refreshToken(refreshToken: string, accessToken: string) {
    try {
      const token = await this.redisClient.get(
        `${REDIS_KEY_PREFIX.REFRESH_TOKEN}:${refreshToken}`,
      );
      if (!token) {
        throwGrpcError(401, SERVER_MESSAGE.UNAUTHORIZED, [
          USER_MESSAGES.INVALID_REFRESH_TOKEN,
        ]);
      }

      const decoded = await this.jwtService.verifyToken(refreshToken);
      if (!decoded) {
        throwGrpcError(401, SERVER_MESSAGE.UNAUTHORIZED, [
          USER_MESSAGES.INVALID_REFRESH_TOKEN,
        ]);
      }

      const { user_id, verify, role } = decoded as TokenPayload;
      if (!user_id) {
        throwGrpcError(401, SERVER_MESSAGE.UNAUTHORIZED, [
          USER_MESSAGES.INVALID_TOKEN_PAYLOAD,
        ]);
      }

      const findUser = await prismaAuth.user.findUnique({
        where: { id: user_id },
        select: {
          id: true,
        },
      });
      if (!findUser) {
        throwGrpcError(404, SERVER_MESSAGE.NOT_FOUND, [
          USER_MESSAGES.NOT_FOUND,
        ]);
      }

      const [newAccessToken, newRefreshToken] = await Promise.all([
        this.signAcessToken({
          user_id,
          verify,
          role,
        }),
        this.signRefreshToken({
          user_id,
          verify,
          role,
        }),
      ]);

      console.log('REFRESH TOKEN', { accessToken, newRefreshToken });

      await Promise.all([
        this.redisClient.del(
          `${REDIS_KEY_PREFIX.REFRESH_TOKEN}:${refreshToken}`,
        ),
        this.redisClient.set(
          `${REDIS_KEY_PREFIX.ACCESS_TOKEN}:${newAccessToken}`,
          user_id,
          'EX',
          Number(process.env.JWT_ACCESS_EXPIRATION_TIME) || 900,
        ),
        this.redisClient.del(`${REDIS_KEY_PREFIX.ACCESS_TOKEN}:${accessToken}`),
        this.redisClient.set(
          `${REDIS_KEY_PREFIX.REFRESH_TOKEN}:${newRefreshToken}`,
          user_id,
          'EX',
          Number(process.env.JWT_REFRESH_EXPIRATION_TIME) || 604800,
        ),
      ]);

      return { accessToken, refreshToken: newRefreshToken };
    } catch (error: unknown) {
      if (error instanceof RpcException) {
        throw error;
      }
      const err = error as Error;
      throwGrpcError(500, SERVER_MESSAGE.INTERNAL_SERVER, [err?.message]);
    }
  }

  async getUserByEmail(data: { email: string }): Promise<User> {
    try {
      const { email } = data;
      const result = await prismaAuth.user.findUnique({
        where: { email },
      });

      if (!result) {
        throwGrpcError(404, SERVER_MESSAGE.NOT_FOUND, [
          USER_MESSAGES.NOT_FOUND,
        ]);
      }

      return result;
    } catch (error) {
      if (error instanceof RpcException) {
        throw error;
      }
      const err = error as Error;
      throw new RpcException(err?.message || USER_MESSAGES.GET_ALL_FAILED);
    }
  }

  private async signAcessToken(payload: TokenPayload) {
    return this.jwtService.signToken(payload);
  }

  private async signRefreshToken(payload: TokenPayload, exp?: number) {
    return this.jwtService.signToken(payload, { expiresIn: exp ?? '7d' });
  }

  async decodeToken(token: string) {
    return this.jwtService.decodeToken(token);
  }

  async verifyToken(token: string) {
    return this.jwtService.verifyToken(token);
  }

  async getUserProfile(id: string): Promise<UserResponse> {
    try {
      const user = await this.getUserById(id);
      if (!user) {
        throwGrpcError(404, SERVER_MESSAGE.NOT_FOUND, [
          USER_MESSAGES.NOT_FOUND,
        ]);
      }

      return user;
    } catch (error) {
      if (error instanceof RpcException) {
        throw error;
      }
      const err = error as Error;
      throwGrpcError(500, SERVER_MESSAGE.INTERNAL_SERVER, [err?.message]);
    }
  }

  async changePassword(data: ChangePasswordDto) {
    try {
      if (data.oldPassword === data.newPassword) {
        throwGrpcError(400, SERVER_MESSAGE.BAD_REQUEST, [
          USER_MESSAGES.PASSWORD_SAME,
        ]);
      }

      if (data.newPassword !== data.confirmPassword) {
        throwGrpcError(400, SERVER_MESSAGE.BAD_REQUEST, [
          USER_MESSAGES.PASSWORD_NOT_MATCH,
        ]);
      }

      const findUser = await prismaAuth.user.findUnique({
        where: { id: data.accountId },
        select: { password: true },
      });

      if (!findUser) {
        throwGrpcError(404, USER_MESSAGES.NOT_FOUND, [USER_MESSAGES.NOT_FOUND]);
      }

      const [isMatch, newHashedPassword] = await Promise.all([
        bcrypt.compare(data.oldPassword, findUser.password),
        bcrypt.hash(data.newPassword, 10),
      ]);

      if (!isMatch) {
        throwGrpcError(401, SERVER_MESSAGE.UNAUTHORIZED, [
          USER_MESSAGES.INVALID_PASSWORD,
        ]);
      }

      const user = await prismaAuth.user.update({
        where: { id: data.accountId },
        data: {
          password: newHashedPassword,
        },
      });

      return user;
    } catch (error) {
      if (error instanceof RpcException) {
        throw error;
      }
      const err = error as Error;
      throwGrpcError(500, SERVER_MESSAGE.INTERNAL_SERVER, [err?.message]);
    }
  }

  async resetPassword(data: ResetPasswordDto) {
    try {
      const storedToken = await this.redisClient.get(
        `${REDIS_KEY_PREFIX.PASSWORD_RESET}:${data.resetToken}`,
      );

      if (!storedToken) {
        throwGrpcError(401, SERVER_MESSAGE.UNAUTHORIZED, [
          USER_MESSAGES.INVALID_RESET_TOKEN,
        ]);
      }

      const decoded = await this.jwtService.verifyToken(data.resetToken);
      if (!decoded) {
        throwGrpcError(401, SERVER_MESSAGE.UNAUTHORIZED, [
          USER_MESSAGES.INVALID_RESET_TOKEN,
        ]);
      }

      const { user_id } = decoded as TokenPayload;
      const newHashedPassword = await bcrypt.hash(data.newPassword, 10);

      const user = prismaAuth.user.update({
        where: { id: user_id },
        data: {
          password: newHashedPassword,
        },
      });

      const deletedToken = this.redisClient.del(
        `${REDIS_KEY_PREFIX.PASSWORD_RESET}:${data.resetToken}`,
      );

      await Promise.all([user, deletedToken]);

      return user;
    } catch (error: any) {
      if (error?.code === 'P2025') {
        throwGrpcError(404, USER_MESSAGES.NOT_FOUND, [USER_MESSAGES.NOT_FOUND]);
      }

      if (error instanceof RpcException) {
        throw error;
      }
      const err = error as Error;
      throwGrpcError(500, SERVER_MESSAGE.INTERNAL_SERVER, [err?.message]);
    }
  }

  async verifyOtpSuccess(email: string) {
    try {
      const user = await this.getUserByEmail({ email });

      if (!user) {
        throwGrpcError(404, USER_MESSAGES.NOT_FOUND, [USER_MESSAGES.NOT_FOUND]);
      }

      await prismaAuth.user.update({
        where: { id: user.id },
        data: {
          isFirstLogin: false,
        },
      });

      const resetToken = await this.jwtService.signToken(
        { user_id: user.id } as TokenPayload,
        { expiresIn: '5m' },
      );

      await this.redisClient.set(
        `${REDIS_KEY_PREFIX.PASSWORD_RESET}:${resetToken}`,
        user.email,
        'EX',
        300,
      );

      return resetToken;
    } catch (error) {
      if (error instanceof RpcException) {
        throw error;
      }
      const err = error as Error;
      throwGrpcError(500, SERVER_MESSAGE.INTERNAL_SERVER, [err?.message]);
    }
  }

  async logout(accessToken: string, refreshToken: string) {
    const storedAccessToken = await this.redisClient.get(
      `${REDIS_KEY_PREFIX.ACCESS_TOKEN}:${accessToken}`,
    );
    const storedRefreshToken = await this.redisClient.get(
      `${REDIS_KEY_PREFIX.REFRESH_TOKEN}:${refreshToken}`,
    );
    if (!storedAccessToken || !storedRefreshToken) {
      throwGrpcError(401, SERVER_MESSAGE.UNAUTHORIZED, [
        USER_MESSAGES.INVALID_TOKEN,
      ]);
    }

    await Promise.all([
      this.redisClient.del(`${REDIS_KEY_PREFIX.ACCESS_TOKEN}:${accessToken}`),
      this.redisClient.del(`${REDIS_KEY_PREFIX.REFRESH_TOKEN}:${refreshToken}`),
    ]);
  }

  async welcomeEmail(key: string, email: string, name: string) {
    try {
      this.kafkaClient
        .emit(KAFKA_TOPIC.WELCOME_EMAIL, {
          key: key,
          value: {
            to: email,
            subject: 'Welcome to Mebike',
            template: 'welcome',
            data: {
              name: name,
            },
          },
        })
        .subscribe();
    } catch (error) {
      if (error instanceof RpcException) {
        throw error;
      }
      const err = error as Error;
      throwGrpcError(500, SERVER_MESSAGE.INTERNAL_SERVER, [err?.message]);
    }
  }

  async verifyEmail(accountId: string) {
    const account = await prismaAuth.user.findUnique({
      where: { id: accountId },
      select: { email: true },
    });
    if (!account) {
      throwGrpcError(404, USER_MESSAGES.NOT_FOUND, [USER_MESSAGES.NOT_FOUND]);
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    await this.redisClient.set(
      `${REDIS_KEY_PREFIX.VERIFY_EMAIL}:${account.email}`,
      otpCode,
      'EX',
      300,
    );

    try {
      this.kafkaClient
        .emit(KAFKA_TOPIC.VERIFY_EMAIL, {
          key: accountId,
          value: {
            to: account.email,
            subject: 'Verify your email',
            template: 'verify-email',
            data: {
              email: account.email,
              otp: otpCode,
            },
          },
        })
        .subscribe();
    } catch (error) {
      if (error instanceof RpcException) {
        throw error;
      }
      const err = error as Error;
      throwGrpcError(500, SERVER_MESSAGE.INTERNAL_SERVER, [err?.message]);
    }
  }

  async verifyEmailOtp(data: VerifyEmailDto) {
    const account = await prismaAuth.user.findUnique({
      where: { id: data.accountId },
      select: { email: true },
    });
    if (!account) {
      throwGrpcError(404, USER_MESSAGES.NOT_FOUND, [USER_MESSAGES.NOT_FOUND]);
    }

    const storedOtp = await this.redisClient.get(
      `${REDIS_KEY_PREFIX.VERIFY_EMAIL}:${account.email}`,
    );

    if (storedOtp !== data.otp || !storedOtp) {
      throwGrpcError(404, SERVER_MESSAGE.BAD_REQUEST, [
        USER_MESSAGES.INVALID_OTP,
      ]);
    }

    await this.redisClient.del(
      `${REDIS_KEY_PREFIX.VERIFY_EMAIL}:${account.email}`,
    );
    await firstValueFrom(
      this.userService.UserVerify({ accountId: data.accountId }),
    );
  }
}
