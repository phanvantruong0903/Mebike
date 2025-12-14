import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
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
  throwGrpcError,
  SERVER_MESSAGE,
  USER_MESSAGES,
  Account,
} from '@mebike/common';
import { RoleGuard } from './role.guard';
import { Roles } from './role.decorator';
import { WalletService } from '../wallet/wallet.service';

@Resolver()
export class AuthResolver {
  constructor(
    private readonly authService: AuthService,
    private readonly walletService: WalletService,
  ) {}

  @Mutation(() => RegisterResponse, { name: GRAPHQL_NAME_USER.CREATE })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  async createUser(
    @Args('body') body: CreateUserInput,
  ): Promise<RegisterResponse> {
    const response = await this.authService.createUser(body);
    await this.walletService.createWallet({
      accountId: (response.data as Account)?.id,
    });
    return response;
  }

  @Mutation(() => RegisterResponse, { name: GRAPHQL_NAME_USER.REGISTER })
  async register(
    @Args('body') body: RegisterUserInput,
  ): Promise<RegisterResponse> {
    const response = await this.authService.register(body);
    await this.walletService.createWallet({
      accountId: (response.data as Account)?.id,
    });
    return response;
  }

  @Mutation(() => LoginResponse, { name: GRAPHQL_NAME_USER.LOGIN })
  async login(@Args('body') body: LoginInput): Promise<LoginResponse> {
    return this.authService.login(body);
  }

  @Mutation(() => ResfreshTokenResponse, {
    name: GRAPHQL_NAME_USER.REFRESH_TOKEN,
  })
  async refreshToken(@Context() context: any): Promise<ResfreshTokenResponse> {
    const refreshToken = context.req.cookies['refreshToken'];

    if (!refreshToken) {
      throwGrpcError(401, SERVER_MESSAGE.UNAUTHORIZED, [
        USER_MESSAGES.INVALID_REFRESH_TOKEN,
      ]);
    }
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
  async logout(@Context() data: any): Promise<UserResponse> {
    const accessToken = data.req.cookies['accessToken'];
    const refreshToken = data.req.cookies['refreshToken'];

    if (!accessToken || !refreshToken) {
      throwGrpcError(401, SERVER_MESSAGE.UNAUTHORIZED, [
        USER_MESSAGES.INVALID_REFRESH_TOKEN,
      ]);
    }
    return this.authService.logout({ accessToken, refreshToken });
  }

  @Query(() => String)
  _healthCheck(): string {
    return 'API is running';
  }
}
