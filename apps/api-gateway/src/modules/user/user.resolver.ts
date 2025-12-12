import { BadRequestException, UseGuards } from '@nestjs/common';
import {
  Args,
  Mutation,
  Parent,
  Query,
  Resolver,
  ResolveField,
} from '@nestjs/graphql';

import {
  GRAPHQL_NAME_USER,
  Role,
  UpdateUserInput,
  USER_MESSAGES,
  UserListResponse,
  UserProfile,
  UserResponse,
  GetUsersInput,
  ChangeUserStatusInput,
  Account,
  UserStatsResponse,
} from '@mebike/common';

import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/role.decorator';
import { RoleGuard } from '../auth/role.guard';
import { UserService } from './user.service';
import { UserAccountDataloader } from './user-account.dataloader';

@Resolver(() => UserProfile)
export class UserResolver {
  constructor(
    private readonly userService: UserService,
    private readonly dataloader: UserAccountDataloader,
  ) {}

  @Query(() => UserListResponse, { name: GRAPHQL_NAME_USER.GET_ALL })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  async getAllUser(
    @Args('params', {
      nullable: true,
      type: () => GetUsersInput,
      defaultValue: {},
    })
    data?: GetUsersInput,
  ): Promise<UserListResponse> {
    const page = data?.page ?? 1;
    const limit = data?.limit ?? 10;

    return this.userService.getAllUser({ page, limit });
  }

  @Query(() => UserResponse, { name: GRAPHQL_NAME_USER.GET_ONE })
  @UseGuards(JwtAuthGuard)
  async getUserDetail(
    @Args('params', { type: () => String, nullable: true })
    id: string | undefined,
    @CurrentUser() user: UserProfile,
  ): Promise<UserResponse> {
    let userId = '';
    if (user.role === Role.ADMIN) {
      userId = id || user.accountId;
    } else {
      userId = user.accountId;
    }

    return this.userService.getUserDetail(userId);
  }

  @Mutation(() => UserResponse, { name: GRAPHQL_NAME_USER.UPDATE })
  @UseGuards(JwtAuthGuard)
  async updateUser(
    @CurrentUser() user: UserProfile,
    @Args('data') data: UpdateUserInput,
  ): Promise<UserResponse> {
    const id = user?.accountId;
    return this.userService.updateUser(id, data);
  }

  @Mutation(() => UserResponse, { name: GRAPHQL_NAME_USER.CHANGE_STATUS })
  @UseGuards(JwtAuthGuard)
  async changeStatus(
    @Args('data') data: ChangeUserStatusInput,
  ): Promise<UserResponse> {
    return this.userService.changeStatus(data);
  }

  @ResolveField(() => Account)
  async userAccount(@Parent() user: UserProfile): Promise<Account> {
    return this.dataloader.batchAccounts.load(user.accountId);
  }

  @Query(() => UserStatsResponse, { name: GRAPHQL_NAME_USER.GET_STATS })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  async getUserStats(): Promise<UserStatsResponse> {
    return this.userService.getUserStats();
  }

  @Query(() => String)
  _healthCheck(): string {
    return 'API is running';
  }
}
