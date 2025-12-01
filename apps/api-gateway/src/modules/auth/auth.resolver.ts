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
  LoginInput,
  ChangePasswordResponse,
  ChangePasswordInput,
  Role,
  RegisterInput,
} from '@mebike/common';
import type { UserProfile } from '@mebike/common';
import { RoleGuard } from './role.guard';
import { Roles } from './role.decorator';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => RegisterResponse, { name: GRAPHQL_NAME_USER.CREATE })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  async createUser(
    @Args('body', { type: () => CreateUserInput }) body: CreateUserInput,
  ): Promise<RegisterResponse> {
    return this.authService.createUser(body);
  }

  @Mutation(() => RegisterResponse, { name: GRAPHQL_NAME_USER.REGISTER })
  async registerUser(
    @Args('body', { type: () => RegisterInput }) body: RegisterInput,
  ): Promise<RegisterResponse> {
    return this.authService.registerUser(body);
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

  @Query(() => String)
  _healthCheck(): string {
    return 'API is running';
  }
}
