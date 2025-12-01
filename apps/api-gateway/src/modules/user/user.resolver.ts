import { BadRequestException, UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

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
} from '@loginex/common';

import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/role.decorator';
import { RoleGuard } from '../auth/role.guard';
import { UserService } from './user.service';

@Resolver()
export class UserResolver {
  constructor(private readonly userService: UserService) {}

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
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN, Role.USER)
  async getUserDetail(
    @Args('params', { type: () => String, nullable: true })
    id: string | undefined,
    @CurrentUser() user: UserProfile,
  ): Promise<UserResponse> {
    let userId = '';
    if (user.role === Role.ADMIN) {
      if (!id) {
        throw new BadRequestException(USER_MESSAGES.ID_REQUIRED);
      }
      userId = id;
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

  @Query(() => String)
  _healthCheck(): string {
    return 'API is running';
  }
}
