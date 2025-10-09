import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import {
  BaseService,
  JwtServiceCustom,
  SERVER_MESSAGE,
  TokenPayload,
} from '@mebike/common';
import { CreateUserDto } from './dto/CreateUserDto';
import { prisma } from '@mebike/common';
import { LoginUserDto } from './dto/LoginUserDto';
import { plainToInstance } from 'class-transformer';
import { validateOrReject } from 'class-validator';
import { USER_MESSAGES } from '@mebike/common';
import { throwGrpcError } from '@mebike/common';
import * as bcrypt from 'bcrypt';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class AuthService extends BaseService<User, CreateUserDto, never> {
  constructor(private readonly jwtService: JwtServiceCustom) {
    super(prisma.user);
  }

  async validateUser(data: LoginUserDto) {
    if (data) {
      const dtoInstance = plainToInstance(LoginUserDto, data);
      try {
        await validateOrReject(dtoInstance);
        const findUser = await prisma.user.findUnique({
          where: { email: dtoInstance.email },
        });
        if (!findUser) {
          throwGrpcError(SERVER_MESSAGE.NOT_FOUND, [USER_MESSAGES.NOT_FOUND]);
        }

        const isMatch = await bcrypt.compare(
          dtoInstance.password,
          findUser?.password,
        );

        if (!isMatch) {
          throwGrpcError(SERVER_MESSAGE.NOT_FOUND, [
            USER_MESSAGES.VALIDATION_FAILED,
          ]);
        }
        return { user_id: findUser.id, verify: findUser.verify };
      } catch (error: unknown) {
        if (error instanceof RpcException) {
          throw error;
        }
        const err = error as Error;
        throwGrpcError(SERVER_MESSAGE.INTERNAL_SERVER, [err?.message]);
      }
    } else {
      throwGrpcError(SERVER_MESSAGE.BAD_REQUEST, [USER_MESSAGES.INVALID_DATA]);
    }
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

      const { user_id, verify } = decoded as TokenPayload;
      if (!user_id) {
        throwGrpcError(SERVER_MESSAGE.UNAUTHORIZED, [
          USER_MESSAGES.INVALID_TOKEN_PAYLOAD,
        ]);
      }

      const findUser = await prisma.user.findUnique({ where: { id: user_id } });
      if (!findUser) {
        throwGrpcError(SERVER_MESSAGE.NOT_FOUND, [USER_MESSAGES.NOT_FOUND]);
      }

      const accessToken = await this.jwtService.signToken({ user_id, verify });
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
}
