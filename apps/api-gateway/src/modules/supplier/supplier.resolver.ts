import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  Role,
  CreateSupplierInput,
  UpdateSupplierInput,
  UpdateSupplierDto,
  SupplierResponse,
  GRAPHQL_NAME_SUPPLIER,
  SupplierListResponse,
  GetSupplierInput,
  SupplierStatsResponse,
  SupplierSearchResult,
  SupplierSearchPage,
  ChangeSupplierStatusDto,
} from '@mebike/common';
import { RoleGuard } from '../auth/role.guard';
import { Roles } from '../auth/role.decorator';
import { SupplierService } from './supplier.service';

@Resolver()
export class SupplierResolver {
  constructor(private readonly supplierService: SupplierService) {}

  @Mutation(() => SupplierResponse, { name: GRAPHQL_NAME_SUPPLIER.CREATE })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  async createSupplier(
    @Args('body') body: CreateSupplierInput,
  ): Promise<SupplierResponse> {
    return this.supplierService.createSupplier(body);
  }

  @Mutation(() => SupplierResponse, { name: GRAPHQL_NAME_SUPPLIER.UPDATE })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  async updateSupplier(
    @Args('body') body: UpdateSupplierInput,
    @Args('id') id: string,
  ): Promise<SupplierResponse> {
    return this.supplierService.updateSupplier({
      id,
      ...body,
    } as unknown as UpdateSupplierDto);
  }

  @Query(() => SupplierResponse, { name: GRAPHQL_NAME_SUPPLIER.GET_ONE })
  async getSupplier(@Args('id') id: string): Promise<SupplierResponse> {
    return this.supplierService.getSupplier({ id });
  }

  @Query(() => SupplierListResponse, { name: GRAPHQL_NAME_SUPPLIER.GET_ALL })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  async getAllSuppliers(
    @Args('params', {
      nullable: true,
      type: () => GetSupplierInput,
      defaultValue: {},
    })
    data: GetSupplierInput,
  ): Promise<SupplierListResponse> {
    const page = data?.page ?? 1;
    const limit = data?.limit ?? 10;
    return this.supplierService.getAllSuppliers({ page, limit });
  }

  @Mutation(() => SupplierResponse, {
    name: GRAPHQL_NAME_SUPPLIER.CHANGE_STATUS,
  })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  async changeSupplierStatus(
    @Args('body') body: CreateSupplierInput,
  ): Promise<SupplierResponse> {
    const data = body as unknown as ChangeSupplierStatusDto;
    return this.supplierService.changeSupplierStatus(data);
  }

  @Query(() => SupplierStatsResponse, {
    name: GRAPHQL_NAME_SUPPLIER.GET_STATS,
  })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  async getSupplierStats(): Promise<SupplierStatsResponse> {
    return this.supplierService.getSupplierStats();
  }

  @Query(() => [SupplierSearchResult], {
    name: GRAPHQL_NAME_SUPPLIER.AUTO_COMPLETE,
  })
  async autoCompleteSupplier(
    @Args('query', { type: () => String }) query: string,
  ): Promise<SupplierSearchResult[]> {
    return this.supplierService.autoComplete(query);
  }

  @Query(() => SupplierSearchPage, { name: GRAPHQL_NAME_SUPPLIER.SEARCH })
  async searchSupplier(
    @Args('q', { nullable: true }) q: string,
    @Args('params', {
      nullable: true,
      type: () => GetSupplierInput,
      defaultValue: {},
    })
    data: GetSupplierInput,
  ): Promise<SupplierSearchPage> {
    const page = data.page ?? 1;
    const limit = data.limit ?? 10;
    const search = q ?? '';

    return this.supplierService.searchSupplier(page, limit, search);
  }

  @Query(() => String)
  _healthCheck(): string {
    return 'API is running';
  }
}
