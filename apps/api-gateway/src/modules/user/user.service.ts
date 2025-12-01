import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { Observable, lastValueFrom } from 'rxjs';
import {
  GRPC_PACKAGE,
  GRPC_SERVICES,
  UserListResponse,
  UserResponse,
  UpdateUserInput,
  UserStatus,
} from '@loginex/common';

interface UserServiceClient {
  GetAllUsers(data: {
    page: number;
    limit: number;
  }): Observable<UserListResponse>;
  GetUser(data: { id: string }): Observable<UserResponse>;
  UpdateUser(data: { id: string } & UpdateUserInput): Observable<UserResponse>;
  ChangePassword(data: {
    id: string;
    password: string;
  }): Observable<UserResponse>;
  ChangeStatus(data: {
    accountId: string;
    status: UserStatus;
  }): Observable<UserResponse>;
}

@Injectable()
export class UserService implements OnModuleInit {
  private userService!: UserServiceClient;

  constructor(@Inject(GRPC_PACKAGE.USER) private readonly client: ClientGrpc) {}

  onModuleInit() {
    this.userService = this.client.getService<UserServiceClient>(
      GRPC_SERVICES.USER,
    );
  }

  async getAllUser(data: { page: number; limit: number }) {
    return await lastValueFrom(this.userService.GetAllUsers(data));
  }

  async getUserDetail(id: string) {
    return await lastValueFrom(this.userService.GetUser({ id }));
  }

  async updateUser(id: string, data: UpdateUserInput) {
    const payload = { id, ...data };
    return await lastValueFrom(this.userService.UpdateUser(payload));
  }

  async changePassword(id: string, password: string) {
    const payload = { id, password };
    return await lastValueFrom(this.userService.ChangePassword(payload));
  }

  async changeStatus(data: { accountId: string; status: UserStatus }) {
    return await lastValueFrom(this.userService.ChangeStatus(data));
  }
}
