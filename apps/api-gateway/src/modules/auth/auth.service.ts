import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { Observable, firstValueFrom } from 'rxjs';
import {
  RegisterResponse,
  LoginResponse,
  ResfreshTokenResponse,
  GRPC_PACKAGE,
  GRPC_SERVICES,
  LoginInput,
  ChangePasswordInput,
  ChangePasswordResponse,
  RegisterUserInput,
  CreateUserInput,
  UserResponse,
  VerifyOtpInput,
  ResetPasswordRequestInput,
  ResetPasswordInput,
  VerifyOtpResponse,
} from '@mebike/common';

interface AuthServiceClient {
  LoginUser(data: LoginInput): Observable<LoginResponse>;
  CreateUser(data: CreateUserInput): Observable<RegisterResponse>;
  RefreshToken(refreshToken: object): Observable<ResfreshTokenResponse>;
  ChangePassword(
    data: ChangePasswordInput & { accountId: string },
  ): Observable<ChangePasswordResponse>;
  Register(data: RegisterUserInput): Observable<RegisterResponse>;
  ResetPasswordRequest(
    data: ResetPasswordRequestInput,
  ): Observable<UserResponse>;
  ResetPassword(data: ResetPasswordInput): Observable<RegisterResponse>;
  VerifyOtp(data: VerifyOtpInput): Observable<VerifyOtpResponse>;
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

  async createUser(data: CreateUserInput) {
    return await firstValueFrom(this.userService.CreateUser(data));
  }

  async register(data: RegisterUserInput) {
    return await firstValueFrom(this.userService.Register(data));
  }

  async refreshToken(refreshToken: string) {
    return await firstValueFrom(
      this.userService.RefreshToken({ refreshToken }),
    );
  }

  async changePassword(data: ChangePasswordInput & { accountId: string }) {
    return await firstValueFrom(this.userService.ChangePassword(data));
  }

  async resetPasswordRequest(email: string) {
    return await firstValueFrom(
      this.userService.ResetPasswordRequest({ email }),
    );
  }

  async verifyOtp(data: VerifyOtpInput) {
    return await firstValueFrom(this.userService.VerifyOtp(data));
  }

  async resetPassword(data: ResetPasswordInput) {
    return await firstValueFrom(this.userService.ResetPassword(data));
  }
}
