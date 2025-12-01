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
} from '@loginex/common';
import * as bcrypt from 'bcrypt';
import { RpcException } from '@nestjs/microservices';
import type { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom, Observable } from 'rxjs';

interface UserServiceClient {
  GetUser(data: { id: string }): Observable<UserResponse>;
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
        },
      });

      const findUser = await findUserPromise;
      if (!findUser) {
        throwGrpcError(SERVER_MESSAGE.NOT_FOUND, [USER_MESSAGES.NOT_FOUND]);
      }

      const isMatchPromise = bcrypt.compare(data.password, findUser.password);
      const profilePromise = this.getUserProfile(findUser.id);

      const [isMatch, userProfile] = await Promise.all([
        isMatchPromise,
        profilePromise,
      ]);

      if (!isMatch) {
        throwGrpcError(SERVER_MESSAGE.NOT_FOUND, [
          USER_MESSAGES.VALIDATION_FAILED,
        ]);
      }

      const userData = userProfile.data as UserProfile;

      if (userData.status !== UserStatus.Active) {
        throwGrpcError(USER_MESSAGES.USER_STATUS_INVALID, [
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
      throwGrpcError(SERVER_MESSAGE.INTERNAL_SERVER, [err?.message]);
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

    return { accessToken, refreshToken };
  }

  async refreshToken(refreshToken: string) {
    try {
      const decoded = await this.jwtService.verifyToken(refreshToken);
      if (!decoded) {
        throwGrpcError(SERVER_MESSAGE.UNAUTHORIZED, [
          USER_MESSAGES.INVALID_REFRESH_TOKEN,
        ]);
      }

      const { user_id, verify, role } = decoded as TokenPayload;
      if (!user_id) {
        throwGrpcError(SERVER_MESSAGE.UNAUTHORIZED, [
          USER_MESSAGES.INVALID_TOKEN_PAYLOAD,
        ]);
      }

      const findUser = await prismaAuth.user.findUnique({
        where: { id: user_id },
      });
      if (!findUser) {
        throwGrpcError(SERVER_MESSAGE.NOT_FOUND, [USER_MESSAGES.NOT_FOUND]);
      }

      const accessToken = await this.jwtService.signToken({
        user_id,
        verify,
        role,
      });
      return { accessToken };
    } catch (error: unknown) {
      if (error instanceof RpcException) {
        throw error;
      }
      const err = error as Error;
      throwGrpcError(SERVER_MESSAGE.INTERNAL_SERVER, [err?.message]);
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
        throwGrpcError(SERVER_MESSAGE.NOT_FOUND, [USER_MESSAGES.NOT_FOUND]);
      }

      return user;
    } catch (error) {
      if (error instanceof RpcException) {
        throw error;
      }
      const err = error as Error;
      throwGrpcError(SERVER_MESSAGE.INTERNAL_SERVER, [err?.message]);
    }
  }

  async changePassword(data: ChangePasswordDto) {
    try {
      if (data.oldPassword === data.newPassword) {
        throwGrpcError(SERVER_MESSAGE.BAD_REQUEST, [
          USER_MESSAGES.PASSWORD_SAME,
        ]);
      }

      const findUser = await prismaAuth.user.findUnique({
        where: { id: data.accountId },
        select: { password: true },
      });

      if (!findUser) {
        throwGrpcError(USER_MESSAGES.NOT_FOUND, [USER_MESSAGES.NOT_FOUND]);
      }

      const [isMatch, newHashedPassword] = await Promise.all([
        bcrypt.compare(data.oldPassword, findUser.password),
        bcrypt.hash(data.newPassword, 10),
      ]);

      if (!isMatch) {
        throwGrpcError(SERVER_MESSAGE.UNAUTHORIZED, [
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
      throwGrpcError(SERVER_MESSAGE.INTERNAL_SERVER, [err?.message]);
    }
  }
}
