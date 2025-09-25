import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { Observable, lastValueFrom } from 'rxjs';
import { CreateUserDto } from './dto/CreateUserDto';
import { UpdateUserDto } from './dto/UpdateUserDto';
import { GRPC_PACKAGE, GRPC_SERVICES } from '@mebike/common';
import { LoginInput } from './graphql/Login';

interface AuthServiceClient {
  LoginUser(data: LoginInput): Observable<any>;
  CreateUser(data: CreateUserDto): Observable<any>;
  UpdateUser(request: { id: string } & UpdateUserDto): Observable<any>;
  GetUser(request: { id: string }): Observable<any>;
  GetAllUsers(data: object): Observable<any>;
  RefreshToken(refreshToken: object): Observable<any>;
}

@Injectable()
export class AuthService implements OnModuleInit {
  private userService!: AuthServiceClient;

  constructor(@Inject(GRPC_PACKAGE.AUTH) private client: ClientGrpc) {}

  onModuleInit() {
    this.userService = this.client.getService<AuthServiceClient>(
      GRPC_SERVICES.AUTH
    );
  }

  async login(data: LoginInput) {
    return await lastValueFrom(this.userService.LoginUser(data));
  }

  async register(data: CreateUserDto) {
    return await lastValueFrom(this.userService.CreateUser(data));
  }

  async updateUser(id: string, data: UpdateUserDto) {
    return await lastValueFrom(this.userService.UpdateUser({ id, ...data }));
  }

  async userDetail(id: string) {
    return await lastValueFrom(this.userService.GetUser({ id }));
  }

  async getAllUser() {
    const res = await lastValueFrom(this.userService.GetAllUsers({}));
    return res;
  }

  async refreshToken(refreshToken: string) {
    console.log(refreshToken);
    return await lastValueFrom(this.userService.RefreshToken({ refreshToken }));
  }
}
