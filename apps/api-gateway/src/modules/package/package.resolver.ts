import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  Role,
  Package,
  PackageResponse,
  GRAPHQL_NAME_PACKAGE,
  CreatePackageInput,
  UpdatePackageInput,
  PackageListResponse,
  GetPackageListInput,
} from '@mebike/common';
import { RoleGuard } from '../auth/role.guard';
import { Roles } from '../auth/role.decorator';
import { PackageService } from './package.service';

@Resolver(() => Package)
export class PackageResolver {
  constructor(private readonly packageService: PackageService) {}

  @Mutation(() => PackageResponse, {
    name: GRAPHQL_NAME_PACKAGE.CREATE,
  })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  async createPackage(
    @Args('body') body: CreatePackageInput,
  ): Promise<PackageResponse> {
    try {
      return await this.packageService.createPackage(body);
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

  @Mutation(() => PackageResponse, {
    name: GRAPHQL_NAME_PACKAGE.UPDATE,
  })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  async updatePackage(
    @Args('id') id: string,
    @Args('body') body: UpdatePackageInput,
  ): Promise<PackageResponse> {
    try {
      return await this.packageService.updatePackage({
        id,
        ...body,
      });
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

  @Query(() => PackageResponse, {
    name: GRAPHQL_NAME_PACKAGE.GET_ONE,
  })
  async getPackage(@Args('id') id: string): Promise<PackageResponse> {
    try {
      return await this.packageService.getPackage(id);
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

  @Query(() => PackageListResponse, {
    name: GRAPHQL_NAME_PACKAGE.GET_ALL,
  })
  async getPackageList(
    @Args('params', {
      nullable: true,
      type: () => GetPackageListInput,
      defaultValue: {},
    })
    data: GetPackageListInput,
  ): Promise<PackageListResponse> {
    try {
      const page = data?.page ?? 1;
      const limit = data?.limit ?? 10;

      return await this.packageService.getPackageList({
        page,
        limit,
        search: data.search,
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
      } as PackageListResponse;
    }
  }

  @Mutation(() => PackageResponse, {
    name: GRAPHQL_NAME_PACKAGE.TOGGLE_STATUS,
  })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  async togglePackageStatus(@Args('id') id: string): Promise<PackageResponse> {
    try {
      return await this.packageService.togglePackageStatus(id);
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
