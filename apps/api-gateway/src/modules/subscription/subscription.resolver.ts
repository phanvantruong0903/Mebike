import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  Role,
  CreateSubscriptionInput,
  SubscriptionResponse,
  GRAPHQL_NAME_SUBSCRIPTION,
  SubscriptionListResponse,
  GetSubscriptionListInput,
  Subscription,
  UserProfile,
} from '@mebike/common';
import { RoleGuard } from '../auth/role.guard';
import { Roles } from '../auth/role.decorator';
import { SubscriptionService } from './subscription.service';
import { CurrentUser } from '../auth/current-user.decorator';

@Resolver(() => Subscription)
export class SubscriptionResolver {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Mutation(() => SubscriptionResponse, {
    name: GRAPHQL_NAME_SUBSCRIPTION.CREATE,
  })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.USER)
  async createSubscription(
    @CurrentUser() user: UserProfile,
    @Args('body') body: CreateSubscriptionInput,
  ): Promise<SubscriptionResponse> {
    return this.subscriptionService.createSubscription({
      ...body,
      accountId: user.accountId,
    });
  }

  @Mutation(() => SubscriptionResponse, {
    name: GRAPHQL_NAME_SUBSCRIPTION.ACTIVATE,
  })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.USER)
  async activateSubscription(
    @Args('id') id: string,
  ): Promise<SubscriptionResponse> {
    return this.subscriptionService.activateSubscription(id);
  }

  @Mutation(() => SubscriptionResponse, {
    name: GRAPHQL_NAME_SUBSCRIPTION.EXPIRE,
  })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  async expireSubscription(
    @Args('id') id: string,
  ): Promise<SubscriptionResponse> {
    return this.subscriptionService.expireSubscription(id);
  }

  @Query(() => SubscriptionResponse, {
    name: GRAPHQL_NAME_SUBSCRIPTION.GET_ONE,
  })
  async getSubscription(@Args('id') id: string): Promise<SubscriptionResponse> {
    return this.subscriptionService.getSubscription(id);
  }

  @Query(() => SubscriptionListResponse, {
    name: GRAPHQL_NAME_SUBSCRIPTION.GET_ALL,
  })
  async getSubscriptionList(
    @Args('params', {
      nullable: true,
      type: () => GetSubscriptionListInput,
      defaultValue: {},
    })
    data: GetSubscriptionListInput,
  ): Promise<SubscriptionListResponse> {
    const page = data?.page ?? 1;
    const limit = data?.limit ?? 10;

    return this.subscriptionService.getSubscriptionList({
      page,
      limit,
      search: data.search,
    });
  }

  @Query(() => String)
  _healthCheck(): string {
    return 'API is running';
  }
}
