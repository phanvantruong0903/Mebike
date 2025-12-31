import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
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
    return this.walletService.changeWalletStatus(body);
  }

  @Query(() => WalletResponse, { name: GRAPHQL_NAME_WALLET.GET_ONE })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN, Role.USER)
  async getWallet(
    @Args('accountId') accountId: string,
    @CurrentUser() user: UserProfile,
  ): Promise<WalletResponse> {
    if (user.role === Role.USER) {
      accountId = user.accountId;
    }
    return this.walletService.getWallet({ accountId });
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
    return this.walletService.getAllWallet(data);
  }

  @Query(() => String)
  _healthCheck(): string {
    return 'API is running';
  }
}
