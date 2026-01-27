import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
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
    try {
      return plainToInstance(
        SubscriptionResponse,
        await this.subscriptionService.createSubscription({
          ...body,
          accountId: user.accountId,
        }),
      );
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

  @Mutation(() => SubscriptionResponse, {
    name: GRAPHQL_NAME_SUBSCRIPTION.ACTIVATE,
  })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.USER)
  async activateSubscription(
    @CurrentUser() user: UserProfile,
    @Args('id') id: string,
  ): Promise<SubscriptionResponse> {
    try {
      return plainToInstance(
        SubscriptionResponse,
        await this.subscriptionService.activateSubscription({
          id,
          accountId: user.accountId,
        }),
      );
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

  @Mutation(() => SubscriptionResponse, {
    name: GRAPHQL_NAME_SUBSCRIPTION.EXPIRE,
  })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  async expireSubscription(
    @Args('id') id: string,
  ): Promise<SubscriptionResponse> {
    try {
      return plainToInstance(
        SubscriptionResponse,
        await this.subscriptionService.expireSubscription(id),
      );
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

  @Query(() => SubscriptionResponse, {
    name: GRAPHQL_NAME_SUBSCRIPTION.GET_ONE,
  })
  async getSubscription(@Args('id') id: string): Promise<SubscriptionResponse> {
    try {
      return plainToInstance(
        SubscriptionResponse,
        await this.subscriptionService.getSubscription(id),
      );
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
    try {
      const page = data?.page ?? 1;
      const limit = data?.limit ?? 10;

      return plainToInstance(
        SubscriptionListResponse,
        await this.subscriptionService.getSubscriptionList({
          page,
          limit,
          search: data.search,
        }),
      );
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
          page: data?.page ?? 1,
          limit: data?.limit ?? 10,
          totalPages: 0,
        },
      } as SubscriptionListResponse;
    }
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
