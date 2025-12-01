import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  Role,
  GRAPHQL_NAME_WAREHOUSE,
  CreateWareHouseInput,
  WarehouseResponse,
  UpdateWareHouseInput,
  GetWarehouseInput,
  WarehouseListResponse,
} from '@loginex/common';
import { RoleGuard } from '../auth/role.guard';
import { Roles } from '../auth/role.decorator';
import { WarehouseService } from './warehouse.service';

@Resolver()
export class WarehouseResolver {
  constructor(private readonly warehouseService: WarehouseService) {}

  @Mutation(() => WarehouseResponse, { name: GRAPHQL_NAME_WAREHOUSE.CREATE })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  async createWarehouse(
    @Args('body', { type: () => CreateWareHouseInput })
    body: CreateWareHouseInput,
  ): Promise<WarehouseResponse> {
    return this.warehouseService.createWarehouse(body);
  }

  @Mutation(() => WarehouseResponse, { name: GRAPHQL_NAME_WAREHOUSE.UPDATE })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  async updateWarehouse(
    @Args('body', { type: () => UpdateWareHouseInput })
    body: UpdateWareHouseInput,
    @Args('id') id: string,
  ): Promise<WarehouseResponse> {
    return this.warehouseService.updateWarehouse(id, body);
  }

  @Query(() => WarehouseResponse, { name: GRAPHQL_NAME_WAREHOUSE.GET_ONE })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  async getDetailWarehouse(@Args('id') id: string): Promise<WarehouseResponse> {
    return this.warehouseService.getWarehouse(id);
  }

  @Query(() => WarehouseListResponse, {
    name: GRAPHQL_NAME_WAREHOUSE.GET_ALL,
  })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  async getAllWarehouse(
    @Args('params', {
      nullable: true,
      type: () => GetWarehouseInput,
      defaultValue: {},
    })
    data?: GetWarehouseInput,
  ): Promise<WarehouseListResponse> {
    const page = data?.page ?? 1;
    const limit = data?.limit ?? 10;
    return this.warehouseService.getAllWarehouse({ page, limit });
  }

  @Mutation(() => WarehouseResponse, {
    name: GRAPHQL_NAME_WAREHOUSE.INACTIVATE,
  })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  async InactivateWarehouse(
    @Args('id') id: string,
  ): Promise<WarehouseResponse> {
    return this.warehouseService.inactivateWarehouse({ id });
  }

  @Mutation(() => WarehouseResponse, {
    name: GRAPHQL_NAME_WAREHOUSE.ACTIVATE,
  })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  async ActivateWarehouse(@Args('id') id: string): Promise<WarehouseResponse> {
    return this.warehouseService.activateWarehouse({ id });
  }

  @Mutation(() => WarehouseResponse, {
    name: GRAPHQL_NAME_WAREHOUSE.DELETE,
  })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  async DeleteWarehouse(@Args('id') id: string): Promise<WarehouseResponse> {
    return this.warehouseService.deleteWarehouse({ id });
  }

  @Query(() => String)
  _healthCheck(): string {
    return 'API is running';
  }
}
