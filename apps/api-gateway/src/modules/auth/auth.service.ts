import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { Observable, lastValueFrom } from 'rxjs';
import { CreateUserDto } from './dto/CreateUserDto';
import { GRPC_PACKAGE, GRPC_SERVICES } from '@mebike/common';
import { LoginInput } from './graphql/Login';
import {
  LoginResponse,
  ResfreshTokenResponse,
  UserResponse,
} from './graphql/UserResponse';

interface AuthServiceClient {
  LoginUser(data: LoginInput): Observable<LoginResponse>;
  CreateUser(data: CreateUserDto): Observable<UserResponse>;
  RefreshToken(refreshToken: object): Observable<ResfreshTokenResponse>;
}

@Injectable()
export class AuthService implements OnModuleInit {
  private userService!: AuthServiceClient;

  constructor(@Inject(GRPC_PACKAGE.AUTH) private client: ClientGrpc) {}

  onModuleInit() {
    this.userService = this.client.getService<AuthServiceClient>(
      GRPC_SERVICES.AUTH,
    );
  }

  async login(data: LoginInput) {
    return await lastValueFrom(this.userService.LoginUser(data));
  }

  async register(data: CreateUserDto) {
    return await lastValueFrom(this.userService.CreateUser(data));
  }

  async refreshToken(refreshToken: string) {
    return await lastValueFrom(this.userService.RefreshToken({ refreshToken }));
  }
}
