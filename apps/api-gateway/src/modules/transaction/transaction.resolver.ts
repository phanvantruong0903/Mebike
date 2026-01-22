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
  CreateWithDrawInput,
  CreateWithDrawDto,
  WithdrawResponse,
  WithdrawListResponse,
} from '@mebike/common';
import { RoleGuard } from '../auth/role.guard';
import { Roles } from '../auth/role.decorator';
import { TransactionService } from './transaction.service';
import { CurrentUser } from '../auth/current-user.decorator';

@Resolver()
export class TransactionResolver {
  constructor(private readonly transactionService: TransactionService) {}

  @Mutation(() => WithdrawResponse, {
    name: GRAPHQL_NAME_TRANSACTION.UPDATE_WITHDRAW_STATUS,
  })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  async updateWithdrawStatus(
    @Args('body') body: UpdateWithDrawStatusInput,
  ): Promise<WithdrawResponse> {
    try {
      return await this.transactionService.updateWithdrawStatus(body);
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

  @Query(() => TransactionResponse, { name: GRAPHQL_NAME_TRANSACTION.GET_ONE })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN, Role.USER)
  async getTransaction(
    @Args('id') id: string,
    @CurrentUser() user: UserProfile,
  ): Promise<TransactionResponse> {
    try {
      return await this.transactionService.getTransactionDetail({ id }, user);
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

  @Query(() => TransactionListResponse, {
    name: GRAPHQL_NAME_TRANSACTION.GET_ALL,
  })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN, Role.USER)
  async getAllTransactions(
    @Args('params', {
      nullable: true,
      type: () => GetTransactionInput,
      defaultValue: {},
    })
    data: GetTransactionInput,
    @CurrentUser() user: UserProfile,
  ): Promise<TransactionListResponse> {
    try {
      const page = data?.page ?? 1;
      const limit = data?.limit ?? 10;
      if (user.role === Role.USER) {
        data.accountId = user.accountId;
      }

      return await this.transactionService.getAllTransaction({
        page,
        limit,
        accountId: data.accountId,
      });
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
      } as TransactionListResponse;
    }
  }

  @Mutation(() => WithdrawResponse, {
    name: GRAPHQL_NAME_TRANSACTION.CREATE_WITHDRAW,
  })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.USER)
  async createWithdrawTransaction(
    @Args('body') body: CreateWithDrawInput,
    @CurrentUser() user: UserProfile,
  ): Promise<WithdrawResponse> {
    try {
      return await this.transactionService.createWithdraw({
        ...body,
        accountId: user.accountId,
      } as unknown as CreateWithDrawDto);
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

  @Query(() => WithdrawListResponse, {
    name: GRAPHQL_NAME_TRANSACTION.GET_ALL_WITHDRAW,
  })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN, Role.USER)
  async getAllWithdraws(
    @Args('params', {
      nullable: true,
      type: () => GetTransactionInput,
      defaultValue: {},
    })
    data: GetTransactionInput,
    @CurrentUser() user: UserProfile,
  ): Promise<WithdrawListResponse> {
    try {
      const page = data?.page ?? 1;
      const limit = data?.limit ?? 10;
      if (user.role === Role.USER) {
        data.accountId = user.accountId;
      }

      return await this.transactionService.getAllWithdraw({
        page,
        limit,
        accountId: data.accountId,
      });
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
      } as WithdrawListResponse;
    }
  }

  @Query(() => WithdrawResponse, {
    name: GRAPHQL_NAME_TRANSACTION.GET_ONE_WITHDRAW,
  })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN, Role.USER)
  async getWithdraw(
    @Args('id') id: string,
    @CurrentUser() user: UserProfile,
  ): Promise<WithdrawResponse> {
    try {
      return await this.transactionService.getWithdrawDetail(id, user);
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
