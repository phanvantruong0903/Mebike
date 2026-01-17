import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  Role,
  StationResponse,
  GRAPQL_NAME_STATION,
  CreateStationInput,
  UpdateStationInput,
  StationListResponse,
  GetStationInput,
  UpdateStationStatusInput,
  BikeSearchResult,
  StationSearchPage,
} from '@mebike/common';
import { RoleGuard } from '../auth/role.guard';
import { Roles } from '../auth/role.decorator';
import { StationService } from './station.service';

@Resolver()
export class StationResolver {
  constructor(private readonly stationService: StationService) {}

  @Mutation(() => StationResponse, { name: GRAPQL_NAME_STATION.CREATE })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  async createStation(
    @Args('body') body: CreateStationInput,
  ): Promise<StationResponse> {
    return this.stationService.createStation(body);
  }

  @Mutation(() => StationResponse, { name: GRAPQL_NAME_STATION.UPDATE })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  async updateStation(
    @Args('body') body: UpdateStationInput,
    @Args('id') id: string,
  ): Promise<StationResponse> {
    return this.stationService.updateStation(id, body);
  }

  @Query(() => StationResponse, { name: GRAPQL_NAME_STATION.GET_ONE })
  async getStation(@Args('id') id: string): Promise<StationResponse> {
    return this.stationService.getStation({ id });
  }

  @Query(() => StationListResponse, { name: GRAPQL_NAME_STATION.GET_ALL })
  async getAllStation(
    @Args('params', {
      nullable: true,
      type: () => GetStationInput,
      defaultValue: {},
    })
    data: GetStationInput,
  ): Promise<StationListResponse> {
    const page = data?.page ?? 1;
    const limit = data?.limit ?? 10;

    const { latitude, longitude, status } = data || {};
    return this.stationService.getAllStation({
      page,
      limit,
      latitude,
      longitude,
      status,
    });
  }

  @Mutation(() => StationResponse, { name: GRAPQL_NAME_STATION.UPDATE_STATUS })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  async updateStationStatus(
    @Args('body') body: UpdateStationStatusInput,
  ): Promise<StationResponse> {
    return this.stationService.changeStationStatus(body);
  }

  @Query(() => [BikeSearchResult], { name: GRAPQL_NAME_STATION.AUTO_COMPLETE })
  async autoCompleteStation(
    @Args('query', { type: () => String }) query: string,
  ): Promise<BikeSearchResult[]> {
    return this.stationService.autoComplete(query);
  }

  @Query(() => StationSearchPage, { name: GRAPQL_NAME_STATION.SEARCH })
  async searchStation(
    @Args('q', { nullable: true }) q: string,
    @Args('params', {
      nullable: true,
      type: () => GetStationInput,
      defaultValue: {},
    })
    data: GetStationInput,
  ): Promise<StationSearchPage> {
    const page = data.page ?? 1;
    const limit = data.limit ?? 10;
    const search = q ?? '';

    return this.stationService.searchStation(page, limit, search);
  }

  @Query(() => String)
  _healthCheck(): string {
    return 'API is running';
  }
}
