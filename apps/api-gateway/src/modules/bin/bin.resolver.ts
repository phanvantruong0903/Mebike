import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  Role,
  GRAPHQL_NAME_BIN,
  CreateBinInput,
  BinResponse,
  UpdateBinInput,
  GetBinInput,
  BinListResponse,
} from '@loginex/common';
import { RoleGuard } from '../auth/role.guard';
import { Roles } from '../auth/role.decorator';
import { BinService } from './bin.service';

@Resolver()
export class BinResolver {
  constructor(private readonly binService: BinService) {}

  @Mutation(() => BinResponse, { name: GRAPHQL_NAME_BIN.CREATE })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  async createBin(
    @Args('body', { type: () => CreateBinInput })
    body: CreateBinInput,
  ): Promise<BinResponse> {
    return this.binService.createBin(body);
  }

  @Mutation(() => BinResponse, { name: GRAPHQL_NAME_BIN.UPDATE })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  async updateBin(
    @Args('body', { type: () => UpdateBinInput })
    body: UpdateBinInput,
    @Args('id') id: string,
  ): Promise<BinResponse> {
    return this.binService.updateBin(id, body);
  }

  @Query(() => BinListResponse, {
    name: GRAPHQL_NAME_BIN.GET_ALL,
  })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  async getAllBin(
    @Args('params', {
      nullable: true,
      type: () => GetBinInput,
      defaultValue: {},
    })
    data?: GetBinInput,
  ): Promise<BinListResponse> {
    const page = data?.page ?? 1;
    const limit = data?.limit ?? 10;
    return this.binService.getAllBin({ page, limit });
  }

  @Mutation(() => BinResponse, {
    name: GRAPHQL_NAME_BIN.DELETE,
  })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  async DeleteBin(@Args('id') id: string): Promise<BinResponse> {
    return this.binService.deleteBin({ id });
  }

  @Query(() => String)
  _healthCheck(): string {
    return 'API is running';
  }
}
