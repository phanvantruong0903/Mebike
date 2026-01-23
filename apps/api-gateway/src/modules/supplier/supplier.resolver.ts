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
    try {
      return await this.supplierService.createSupplier(body);
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

  @Mutation(() => SupplierResponse, { name: GRAPHQL_NAME_SUPPLIER.UPDATE })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  async updateSupplier(
    @Args('body') body: UpdateSupplierInput,
    @Args('id') id: string,
  ): Promise<SupplierResponse> {
    try {
      return await this.supplierService.updateSupplier({
        id,
        ...body,
      } as unknown as UpdateSupplierDto);
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

  @Query(() => SupplierResponse, { name: GRAPHQL_NAME_SUPPLIER.GET_ONE })
  async getSupplier(@Args('id') id: string): Promise<SupplierResponse> {
    try {
      return await this.supplierService.getSupplier({ id });
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
    try {
      const page = data?.page ?? 1;
      const limit = data?.limit ?? 10;
      return await this.supplierService.getAllSuppliers({ page, limit });
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
      } as SupplierListResponse;
    }
  }

  @Mutation(() => SupplierResponse, {
    name: GRAPHQL_NAME_SUPPLIER.CHANGE_STATUS,
  })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  async changeSupplierStatus(
    @Args('body') body: CreateSupplierInput,
  ): Promise<SupplierResponse> {
    try {
      const data = body as unknown as ChangeSupplierStatusDto;
      return await this.supplierService.changeSupplierStatus(data);
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

  @Query(() => SupplierStatsResponse, {
    name: GRAPHQL_NAME_SUPPLIER.GET_STATS,
  })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  async getSupplierStats(): Promise<SupplierStatsResponse> {
    try {
      return await this.supplierService.getSupplierStats();
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

  @Query(() => [SupplierSearchResult], {
    name: GRAPHQL_NAME_SUPPLIER.AUTO_COMPLETE,
  })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  async autoCompleteSupplier(
    @Args('query', { type: () => String }) query: string,
  ): Promise<SupplierSearchResult[]> {
    try {
      return await this.supplierService.autoComplete(query);
    } catch (error) {
      return [];
    }
  }

  @Query(() => SupplierSearchPage, { name: GRAPHQL_NAME_SUPPLIER.SEARCH })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  async searchSupplier(
    @Args('q', { nullable: true }) q: string,
    @Args('params', {
      nullable: true,
      type: () => GetSupplierInput,
      defaultValue: {},
    })
    data: GetSupplierInput,
  ): Promise<SupplierSearchPage> {
    try {
      const page = data.page ?? 1;
      const limit = data.limit ?? 10;
      const search = q ?? '';

      return await this.supplierService.searchSupplier(page, limit, search);
    } catch (error) {
      return {
        data: [],
        pagination: {
          total: 0,
          page: data?.page ?? 1,
          limit: data?.limit ?? 10,
          totalPages: 0,
        },
      };
    }
  }

  @Query(() => String)
  _healthCheck(): string {
    return 'API is running';
  }
}
