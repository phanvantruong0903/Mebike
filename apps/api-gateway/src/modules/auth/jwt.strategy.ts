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
} from '@mebike/common';
import type { ClientGrpc } from '@nestjs/microservices';

interface IUserServiceClient {
  GetUser(data: { id: string }): Observable<UserResponse>;
}

@Injectable()
export class JwtStrategy
  extends PassportStrategy(Strategy)
  implements OnModuleInit
{
  private userServiceCLient!: IUserServiceClient;

  constructor(@Inject(GRPC_PACKAGE.USER) private readonly client: ClientGrpc) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: JWT_CONSTANTS.ACCESS_SECRET,
    });
  }

  onModuleInit() {
    this.userServiceCLient = this.client.getService<IUserServiceClient>(
      GRPC_SERVICES.USER,
    );
  }

  async validate(payload: TokenPayload) {
    if (!this.userServiceCLient) {
      throwGrpcError(SERVER_MESSAGE.INTERNAL_SERVER, [
        'User service is not available',
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
