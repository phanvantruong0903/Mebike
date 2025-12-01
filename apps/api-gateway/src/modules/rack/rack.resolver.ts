import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  Role,
  RackResponse,
  GRAPHQL_NAME_RACK,
  CreateRackInput,
  UpdateRackInput,
  RackListResponse,
  GetRackInput,
} from '@loginex/common';
import { RoleGuard } from '../auth/role.guard';
import { Roles } from '../auth/role.decorator';
import { RackService } from './rack.service';

@Resolver()
export class RackResolver {
  constructor(private readonly rackService: RackService) {}

  @Mutation(() => RackResponse, { name: GRAPHQL_NAME_RACK.CREATE })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  async createRack(
    @Args('body', { type: () => CreateRackInput })
    body: CreateRackInput,
  ): Promise<RackResponse> {
    return this.rackService.createRack(body);
  }

  @Mutation(() => RackResponse, { name: GRAPHQL_NAME_RACK.UPDATE })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  async updateRack(
    @Args('body', { type: () => UpdateRackInput })
    body: UpdateRackInput,
    @Args('id') id: string,
  ): Promise<RackResponse> {
    return this.rackService.updateRack(id, body);
  }

  @Query(() => RackListResponse, {
    name: GRAPHQL_NAME_RACK.GET_ALL,
  })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  async getAllRack(
    @Args('params', {
      nullable: true,
      type: () => GetRackInput,
      defaultValue: {},
    })
    data?: GetRackInput,
  ): Promise<RackListResponse> {
    const page = data?.page ?? 1;
    const limit = data?.limit ?? 10;
    return this.rackService.getAllRack({ page, limit });
  }

  @Mutation(() => RackResponse, {
    name: GRAPHQL_NAME_RACK.DELETE,
  })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  async deleteRack(@Args('id') id: string): Promise<RackResponse> {
    return this.rackService.deleteRack({ id });
  }

  @Query(() => String)
  _healthCheck(): string {
    return 'API is running';
  }
}
