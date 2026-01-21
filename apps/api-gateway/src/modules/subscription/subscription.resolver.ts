import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
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
  Package,
} from '@mebike/common';
import type { SubscriptionModel } from '@mebike/common';
import { RoleGuard } from '../auth/role.guard';
import { Roles } from '../auth/role.decorator';
import { SubscriptionService } from './subscription.service';
import { CurrentUser } from '../auth/current-user.decorator';
import { UserProfileDataLoader } from '../user/user-profile.dataloader';
import { PackageDataloader } from '../package/package.dataloader';

@Resolver(() => Subscription)
export class SubscriptionResolver {
  constructor(
    private readonly subscriptionService: SubscriptionService,
    private readonly userProfileDataloader: UserProfileDataLoader,
    private readonly packageDataloader: PackageDataloader,
  ) {}

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
    @CurrentUser() user: UserProfile,
    @Args('id') id: string,
  ): Promise<SubscriptionResponse> {
    return this.subscriptionService.activateSubscription({
      id,
      accountId: user.accountId,
    });
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

  @ResolveField(() => UserProfile)
  async user(@Parent() subscription: SubscriptionModel): Promise<UserProfile> {
    return this.userProfileDataloader.batchUserProfiles.load(
      subscription.accountId,
    );
  }

  @ResolveField(() => Package)
  async package(@Parent() subscription: SubscriptionModel): Promise<Package> {
    return this.packageDataloader.batchPackages.load(subscription.packageId);
  }

  @Query(() => String)
  _healthCheck(): string {
    return 'API is running';
  }
}
