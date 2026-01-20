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
    return this.packageService.createPackage(body);
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
    return this.packageService.updatePackage({
      id,
      ...body,
    });
  }

  @Query(() => PackageResponse, {
    name: GRAPHQL_NAME_PACKAGE.GET_ONE,
  })
  async getPackage(@Args('id') id: string): Promise<PackageResponse> {
    return this.packageService.getPackage(id);
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
    const page = data?.page ?? 1;
    const limit = data?.limit ?? 10;

    return this.packageService.getPackageList({
      page,
      limit,
      search: data.search,
    });
  }

  @Mutation(() => PackageResponse, {
    name: GRAPHQL_NAME_PACKAGE.TOGGLE_STATUS,
  })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  async togglePackageStatus(@Args('id') id: string): Promise<PackageResponse> {
    return this.packageService.togglePackageStatus(id);
  }

  @Query(() => String)
  _healthCheck(): string {
    return 'API is running';
  }
}
