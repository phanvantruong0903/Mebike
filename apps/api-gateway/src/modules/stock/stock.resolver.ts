import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  Role,
  GetStockInput,
  UpdateStockInput,
  StockLevelResponse,
  GRAPHQL_NAME_STOCK,
} from '@loginex/common';
import { RoleGuard } from '../auth/role.guard';
import { Roles } from '../auth/role.decorator';
import { StockService } from './stock.service';

@Resolver()
export class StockResolver {
  constructor(private readonly stockService: StockService) {}

  @Query(() => StockLevelResponse, { name: GRAPHQL_NAME_STOCK.GET_STOCK_LEVEL })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  async getStockLevel(
    @Args('data', { type: () => GetStockInput })
    data: GetStockInput,
  ): Promise<StockLevelResponse> {
    return this.stockService.getStockLevel(data);
  }

  @Mutation(() => StockLevelResponse, { name: GRAPHQL_NAME_STOCK.ADJUST_STOCK })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  async adjustStock(
    @Args('data', { type: () => UpdateStockInput })
    data: UpdateStockInput,
  ): Promise<StockLevelResponse> {
    return this.stockService.adjustStock(data);
  }
}
