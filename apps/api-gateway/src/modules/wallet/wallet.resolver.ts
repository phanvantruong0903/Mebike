import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  Role,
  UpdateWithDrawStatusInput,
  TransactionResponse,
  GRAPHQL_NAME_TRANSACTION,
  TransactionListResponse,
  GetTransactionInput,
  UserProfile,
  UpdateWalletStatusInput,
  GetWalletInput,
  GRAPHQL_NAME_WALLET,
} from '@mebike/common';
import { RoleGuard } from '../auth/role.guard';
import { Roles } from '../auth/role.decorator';
import { WalletService } from './wallet.service';
import { CurrentUser } from '../auth/current-user.decorator';

@Resolver()
export class WalletResolver {
  constructor(private readonly walletService: WalletService) {}

  @Mutation(() => TransactionResponse, {
    name: GRAPHQL_NAME_WALLET.UPDATE_STATUS,
  })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  async updateWalletStatus(
    @Args('body') body: UpdateWalletStatusInput,
  ): Promise<TransactionResponse> {
    return this.walletService.changeWalletStatus(body);
  }

  @Query(() => TransactionResponse, { name: GRAPHQL_NAME_WALLET.GET_ONE })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN, Role.USER)
  async getWallet(
    @Args('accountId') accountId: string,
    @CurrentUser() user: UserProfile,
  ): Promise<TransactionResponse> {
    if (user.role === Role.USER) {
      accountId = user.accountId;
    }
    return this.walletService.getWallet({ accountId });
  }

  @Query(() => TransactionListResponse, {
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
  ): Promise<TransactionListResponse> {
    return this.walletService.getAllWallet(data);
  }

  @Query(() => String)
  _healthCheck(): string {
    return 'API is running';
  }
}
