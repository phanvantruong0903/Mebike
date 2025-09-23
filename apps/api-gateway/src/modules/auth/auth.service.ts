import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { Observable, lastValueFrom } from 'rxjs';
import { LoginUserDto } from './dto/LoginUserDto';
import { CreateUserDto } from './dto/CreateUserDto';
import { UpdateUserDto } from './dto/UpdateUserDto';
import { GRPC_PACKAGE, GRPC_SERVICES } from '@mebike/common';

interface UserServiceClient {
  LoginUser(data: LoginUserDto): Observable<any>;
  CreateUser(data: CreateUserDto): Observable<any>;
  UpdateUser(request: { id: string } & UpdateUserDto): Observable<any>;
  GetUser(request: { id: string }): Observable<any>;
  GetAllUsers(data: {}): Observable<any>;
}

@Injectable()
export class AuthService implements OnModuleInit {
  private userService!: UserServiceClient;

  constructor(@Inject(GRPC_PACKAGE.USER) private client: ClientGrpc) {}

  onModuleInit() {
    this.userService = this.client.getService<UserServiceClient>(
      GRPC_SERVICES.USER
    );
  }

  async login(data: LoginUserDto) {
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
    console.log('GetAllUsers response:', res);
    return res;
  }
}
