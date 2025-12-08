import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { CurrentUser } from './current-user.decorator';
import {
  LoginResponse,
  RegisterResponse,
  ResfreshTokenResponse,
  GRAPHQL_NAME_USER,
  CreateUserInput,
  RegisterUserInput,
  LoginInput,
  ChangePasswordResponse,
  ChangePasswordInput,
  Role,
  UserResponse,
  VerifyOtpInput,
  UserProfile,
  VerifyOtpResponse,
  ResetPasswordInput,
  LogoutInput,
} from '@mebike/common';
import { RoleGuard } from './role.guard';
import { Roles } from './role.decorator';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => RegisterResponse, { name: GRAPHQL_NAME_USER.CREATE })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  async createUser(
    @Args('body') body: CreateUserInput,
  ): Promise<RegisterResponse> {
    return this.authService.createUser(body);
  }

  @Mutation(() => RegisterResponse, { name: GRAPHQL_NAME_USER.REGISTER })
  async register(
    @Args('body') body: RegisterUserInput,
  ): Promise<RegisterResponse> {
    return this.authService.register(body);
  }

  @Mutation(() => LoginResponse, { name: GRAPHQL_NAME_USER.LOGIN })
  async login(@Args('body') body: LoginInput): Promise<LoginResponse> {
    return this.authService.login(body);
  }

  @Mutation(() => ResfreshTokenResponse, {
    name: GRAPHQL_NAME_USER.REFRESH_TOKEN,
  })
  async refreshToken(
    @Args('refreshToken') refreshToken: string,
  ): Promise<ResfreshTokenResponse> {
    return this.authService.refreshToken(refreshToken);
  }

  @Mutation(() => ChangePasswordResponse, {
    name: GRAPHQL_NAME_USER.CHANGE_PASSWORD,
  })
  @UseGuards(JwtAuthGuard)
  async changePassword(
    @CurrentUser() user: UserProfile,
    @Args('body') body: ChangePasswordInput,
  ): Promise<ChangePasswordResponse> {
    return this.authService.changePassword({
      accountId: user.accountId,
      ...body,
    });
  }

  @Mutation(() => UserResponse, {
    name: GRAPHQL_NAME_USER.RESET_PASSWORD_REQUEST,
  })
  async resetPasswordRequest(
    @Args('email') email: string,
  ): Promise<UserResponse> {
    return this.authService.resetPasswordRequest(email);
  }

  @Mutation(() => VerifyOtpResponse, {
    name: GRAPHQL_NAME_USER.VERIFY_OTP,
  })
  async verifyOtp(
    @Args('data', { type: () => VerifyOtpInput }) data: VerifyOtpInput,
  ): Promise<VerifyOtpResponse> {
    return this.authService.verifyOtp(data);
  }

  @Mutation(() => RegisterResponse, {
    name: GRAPHQL_NAME_USER.RESET_PASSWORD,
  })
  async resetPassword(
    @Args('data', { type: () => ResetPasswordInput }) data: ResetPasswordInput,
  ): Promise<RegisterResponse> {
    return this.authService.resetPassword(data);
  }

  @Mutation(() => UserResponse, { name: GRAPHQL_NAME_USER.LOGOUT })
  @UseGuards(JwtAuthGuard)
  async logout(
    @Args('data', { type: () => LogoutInput }) data: LogoutInput,
  ): Promise<UserResponse> {
    return this.authService.logout(data);
  }

  @Query(() => String)
  _healthCheck(): string {
    return 'API is running';
  }
}
