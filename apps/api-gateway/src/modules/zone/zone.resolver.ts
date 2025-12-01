import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  Role,
  GRAPHQL_NAME_ZONE,
  CreateZoneInput,
  ZoneResponse,
  UpdateZoneInput,
  GetZoneInput,
  ZoneListResponse,
} from '@loginex/common';
import { RoleGuard } from '../auth/role.guard';
import { Roles } from '../auth/role.decorator';
import { ZoneService } from './zone.service';

@Resolver()
export class ZoneResolver {
  constructor(private readonly zoneService: ZoneService) {}

  @Mutation(() => ZoneResponse, { name: GRAPHQL_NAME_ZONE.CREATE })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  async createZone(
    @Args('body', { type: () => CreateZoneInput })
    body: CreateZoneInput,
  ): Promise<ZoneResponse> {
    return this.zoneService.createZone(body);
  }

  @Mutation(() => ZoneResponse, { name: GRAPHQL_NAME_ZONE.UPDATE })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  async updateZone(
    @Args('body', { type: () => UpdateZoneInput })
    body: UpdateZoneInput,
    @Args('id') id: string,
  ): Promise<ZoneResponse> {
    return this.zoneService.updateZone(id, body);
  }

  @Query(() => ZoneListResponse, {
    name: GRAPHQL_NAME_ZONE.GET_ALL,
  })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  async getAllZone(
    @Args('params', {
      nullable: true,
      type: () => GetZoneInput,
      defaultValue: {},
    })
    data?: GetZoneInput,
  ): Promise<ZoneListResponse> {
    const page = data?.page ?? 1;
    const limit = data?.limit ?? 10;
    return this.zoneService.getAllZone({ page, limit });
  }

  @Mutation(() => ZoneResponse, {
    name: GRAPHQL_NAME_ZONE.DELETE,
  })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  async deleteZone(@Args('id') id: string): Promise<ZoneResponse> {
    return this.zoneService.deleteZone({ id });
  }

  @Query(() => String)
  _healthCheck(): string {
    return 'API is running';
  }
}
