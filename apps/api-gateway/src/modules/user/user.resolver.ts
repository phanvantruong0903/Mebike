import { UseGuards } from '@nestjs/common';
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
    try {
      const page = data?.page ?? 1;
      const limit = data?.limit ?? 10;
      const status = data?.status;
      return await this.userService.getAllUser({ page, limit, status });
    } catch (error) {
      const err = error as any;
      const statusCode = err?.status || 500;
      const message = err?.message || 'An error occurred';

      return {
        success: false,
        message: message,
        data: [],
        errors: [message],
        statusCode: statusCode,
        pagination: {
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 0,
        },
      } as UserListResponse;
    }
  }

  @Query(() => UserResponse, { name: GRAPHQL_NAME_USER.GET_ONE })
  @UseGuards(JwtAuthGuard)
  async getUserDetail(
    @Args('params', { type: () => String, nullable: true })
    id: string | undefined,
    @CurrentUser() user: UserProfile,
  ): Promise<UserResponse> {
    try {
      let userId = '';
      if (user.role === Role.ADMIN) {
        userId = id || user.accountId;
      } else {
        userId = user.accountId;
      }

      return await this.userService.getUserDetail(userId);
    } catch (error) {
      const err = error as any;
      const statusCode = err?.status || 500;
      const message = err?.message || 'An error occurred';

      return {
        success: false,
        message: message,
        data: null,
        errors: [message],
        statusCode: statusCode,
      };
    }
  }

  @Mutation(() => UserResponse, { name: GRAPHQL_NAME_USER.UPDATE })
  @UseGuards(JwtAuthGuard)
  async updateUser(
    @CurrentUser() user: UserProfile,
    @Args('data') data: UpdateUserInput,
  ): Promise<UserResponse> {
    try {
      const id = user?.accountId;
      return await this.userService.updateUser(id, data);
    } catch (error) {
      const err = error as any;
      const statusCode = err?.status || 500;
      const message = err?.message || 'An error occurred';

      return {
        success: false,
        message: message,
        data: null,
        errors: [message],
        statusCode: statusCode,
      };
    }
  }

  @Mutation(() => UserResponse, { name: GRAPHQL_NAME_USER.CHANGE_STATUS })
  @UseGuards(JwtAuthGuard)
  async changeStatus(
    @Args('data') data: ChangeUserStatusInput,
  ): Promise<UserResponse> {
    try {
      return await this.userService.changeStatus({
        accountId: data.accountId,
        status: data.status,
      });
    } catch (error) {
      const err = error as any;
      const statusCode = err?.status || 500;
      const message = err?.message || 'An error occurred';

      return {
        success: false,
        message: message,
        data: null,
        errors: [message],
        statusCode: statusCode,
      };
    }
  }

  @ResolveField(() => Account)
  async userAccount(@Parent() user: UserProfile): Promise<Account> {
    return this.dataloader.batchAccounts.load(user.accountId);
  }

  @Query(() => UserStatsResponse, { name: GRAPHQL_NAME_USER.GET_STATS })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  async getUserStats(): Promise<UserStatsResponse> {
    try {
      return await this.userService.getUserStats();
    } catch (error) {
      const err = error as any;
      const statusCode = err?.status || 500;
      const message = err?.message || 'An error occurred';

      return {
        success: false,
        message: message,
        data: null,
        errors: [message],
        statusCode: statusCode,
      };
    }
  }

  @Query(() => String)
  _healthCheck(): string {
    return 'API is running';
  }
}
