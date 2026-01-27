import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  Role,
  UserProfile,
  UpdateWalletStatusInput,
  GetWalletInput,
  GRAPHQL_NAME_WALLET,
  WalletResponse,
  WalletListResponse,
} from '@mebike/common';
import { RoleGuard } from '../auth/role.guard';
import { Roles } from '../auth/role.decorator';
import { WalletService } from './wallet.service';
import { CurrentUser } from '../auth/current-user.decorator';

@Resolver()
export class WalletResolver {
  constructor(private readonly walletService: WalletService) {}

  @Mutation(() => WalletResponse, {
    name: GRAPHQL_NAME_WALLET.UPDATE_STATUS,
  })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  async updateWalletStatus(
    @Args('body') body: UpdateWalletStatusInput,
  ): Promise<WalletResponse> {
    try {
      return plainToInstance(
        WalletResponse,
        await this.walletService.changeWalletStatus(body),
      );
    } catch (error) {
      const err = error as any;
      const statusCode = err?.status || 500;
      const message = err?.message || 'An error occurred';

      console.error(error);

      return {
        success: false,
        message: message,
        data: null,
        errors: [message],
        statusCode: statusCode,
      };
    }
  }

  @Query(() => WalletResponse, { name: GRAPHQL_NAME_WALLET.GET_ONE })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN, Role.USER)
  async getWallet(
    @Args('accountId', { type: () => String, nullable: true })
    accountId: string | null,
    @CurrentUser() user: UserProfile,
  ): Promise<WalletResponse> {
    try {
      let userId = '';
      if (user.role === Role.ADMIN) {
        userId = accountId || user.accountId;
      } else {
        userId = user.accountId;
      }

      return plainToInstance(
        WalletResponse,
        await this.walletService.getWallet({ accountId: userId }),
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

  @Query(() => WalletListResponse, {
    name: GRAPHQL_NAME_WALLET.GET_ALL,
  })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  async getAllWallets(
    @Args('params', {
      nullable: true,
      type: () => GetWalletInput,
      defaultValue: {},
    })
    data: GetWalletInput,
  ): Promise<WalletListResponse> {
    try {
      const page = data?.page ?? 1;
      const limit = data?.limit ?? 10;
      const status = data?.status;
      return plainToInstance(
        WalletListResponse,
        await this.walletService.getAllWallet({ page, limit, status }),
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
          page: 1,
          limit: 10,
          totalPages: 0,
        },
      } as WalletListResponse;
    }
  }

  @Query(() => String)
  _healthCheck(): string {
    return 'API is running';
  }
}
