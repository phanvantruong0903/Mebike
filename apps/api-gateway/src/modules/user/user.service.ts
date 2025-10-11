import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { Observable, lastValueFrom } from 'rxjs';
import { GRPC_PACKAGE, GRPC_SERVICES } from '@mebike/common';
import { UserListResponse, UserResponse } from '../auth/graphql/UserResponse';
import { UpdateUserDto } from '../auth/dto/UpdateUserDto';

interface AuthServiceClient {
  GetAllUsers(data: { page?: 1; limit?: 10 }): Observable<UserListResponse>;
  GetUser(data: { id: string }): Observable<UserResponse>;
  UpdateUser(data: { id: string } & UpdateUserDto): Observable<UserResponse>;
  ChangePassword(data: {
    id: string;
    password: string;
  }): Observable<UserResponse>;
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

  async getAllUser(data: { page?: 1; limit?: 10 }) {
    return await lastValueFrom(this.userService.GetAllUsers(data));
  }

  async getUserDetail(id: string) {
    return await lastValueFrom(this.userService.GetUser({ id }));
  }

  async updateUser(id: string, data: UpdateUserDto) {
    const payload = { id, ...data };
    return await lastValueFrom(this.userService.UpdateUser(payload));
  }

  async changePassword(id: string, password: string) {
    const payload = { id, password };
    return await lastValueFrom(this.userService.ChangePassword(payload));
  }
}
