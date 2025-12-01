import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { Observable, firstValueFrom } from 'rxjs';
import {
  CreateUserDto,
  RegisterResponse,
  LoginResponse,
  ResfreshTokenResponse,
  GRPC_PACKAGE,
  GRPC_SERVICES,
  LoginInput,
  ChangePasswordInput,
  ChangePasswordResponse,
} from '@mebike/common';

interface AuthServiceClient {
  LoginUser(data: LoginInput): Observable<LoginResponse>;
  CreateUser(data: CreateUserDto): Observable<RegisterResponse>;
  RefreshToken(refreshToken: object): Observable<ResfreshTokenResponse>;
  ChangePassword(
    data: ChangePasswordInput & { accountId: string },
  ): Observable<ChangePasswordResponse>;
}

@Injectable()
export class AuthService implements OnModuleInit {
  private userService!: AuthServiceClient;

  constructor(@Inject(GRPC_PACKAGE.AUTH) private readonly client: ClientGrpc) {}

  onModuleInit() {
    this.userService = this.client.getService<AuthServiceClient>(
      GRPC_SERVICES.AUTH,
    );
  }

  async login(data: LoginInput) {
    return await firstValueFrom(this.userService.LoginUser(data));
  }

  async register(data: CreateUserDto) {
    return await firstValueFrom(this.userService.CreateUser(data));
  }

  async refreshToken(refreshToken: string) {
    return await firstValueFrom(
      this.userService.RefreshToken({ refreshToken }),
    );
  }

  async changePassword(data: ChangePasswordInput & { accountId: string }) {
    return await firstValueFrom(this.userService.ChangePassword(data));
  }
}
