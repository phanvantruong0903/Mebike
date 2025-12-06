import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { firstValueFrom, Observable } from 'rxjs';
import {
  GRPC_PACKAGE,
  GRPC_SERVICES,
  JWT_CONSTANTS,
  SERVER_MESSAGE,
  throwGrpcError,
  TokenPayload,
  USER_MESSAGES,
  UserResponse,
  REDIS_CONSTANTS,
  REDIS_KEY_PREFIX,
} from '@mebike/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { Redis } from 'ioredis';

interface IUserServiceClient {
  GetUser(data: { id: string }): Observable<UserResponse>;
}

@Injectable()
export class JwtStrategy
  extends PassportStrategy(Strategy)
  implements OnModuleInit
{
  private userServiceCLient!: IUserServiceClient;

  constructor(
    @Inject(GRPC_PACKAGE.USER) private readonly client: ClientGrpc,
    @Inject(REDIS_CONSTANTS.REDIS_CLIENT) private readonly redisClient: Redis,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: JWT_CONSTANTS.ACCESS_SECRET,
      passReqToCallback: true,
    });
  }

  onModuleInit() {
    this.userServiceCLient = this.client.getService<IUserServiceClient>(
      GRPC_SERVICES.USER,
    );
  }

  async validate(req: any, payload: TokenPayload) {
    if (!this.userServiceCLient) {
      throwGrpcError(SERVER_MESSAGE.INTERNAL_SERVER, [
        'User service is not available',
      ]);
    }

    const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
    const isValid = await this.redisClient.get(
      `${REDIS_KEY_PREFIX.ACCESS_TOKEN}:${token}`,
    );

    if (!isValid) {
      throwGrpcError(SERVER_MESSAGE.UNAUTHORIZED, [
        USER_MESSAGES.INVALID_TOKEN_PAYLOAD,
      ]);
    }

    try {
      const findUser: UserResponse = await firstValueFrom(
        this.userServiceCLient.GetUser({ id: payload.user_id }),
      );

      if (!findUser) {
        throwGrpcError(USER_MESSAGES.USER_NOT_FOUND, [
          USER_MESSAGES.USER_NOT_FOUND,
        ]);
      }

      return findUser.data;
    } catch (error) {
      let errorMessage = SERVER_MESSAGE.UNEXPECTED_ERROR;

      if (error instanceof Error) {
        errorMessage = error.message;
      }
      throwGrpcError(SERVER_MESSAGE.INTERNAL_SERVER, [errorMessage]);
    }
  }
}
