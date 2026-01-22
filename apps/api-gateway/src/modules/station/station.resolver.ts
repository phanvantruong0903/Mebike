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
  StationSearchPage,
  UserProfile,
  StationSearchResult,
  StationStatus,
} from '@mebike/common';
import { RoleGuard } from '../auth/role.guard';
import { Roles } from '../auth/role.decorator';
import { StationService } from './station.service';
import { CurrentUser } from '../auth/current-user.decorator';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard';

@Resolver()
export class StationResolver {
  constructor(private readonly stationService: StationService) {}

  @Mutation(() => StationResponse, { name: GRAPQL_NAME_STATION.CREATE })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  async createStation(
    @Args('body') body: CreateStationInput,
  ): Promise<StationResponse> {
    try {
      return await this.stationService.createStation(body);
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

  @Mutation(() => StationResponse, { name: GRAPQL_NAME_STATION.UPDATE })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  async updateStation(
    @Args('body') body: UpdateStationInput,
    @Args('id') id: string,
  ): Promise<StationResponse> {
    try {
      return await this.stationService.updateStation(id, body);
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

  @Query(() => StationResponse, { name: GRAPQL_NAME_STATION.GET_ONE })
  @UseGuards(OptionalJwtAuthGuard)
  async getStation(
    @Args('id') id: string,
    @CurrentUser() user?: UserProfile,
  ): Promise<StationResponse | null> {
    try {
      return await this.stationService.getStation({ id }, user);
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

  @Query(() => StationListResponse, { name: GRAPQL_NAME_STATION.GET_ALL })
  @UseGuards(OptionalJwtAuthGuard)
  async getAllStation(
    @Args('params', {
      nullable: true,
      type: () => GetStationInput,
      defaultValue: {},
    })
    data: GetStationInput,
    @CurrentUser() user?: UserProfile,
  ): Promise<StationListResponse> {
    try {
      const page = data?.page ?? 1;
      const limit = data?.limit ?? 10;

      const isAdmin = user?.role === Role.ADMIN && user?.role;
      const { latitude, longitude } = data || {};
      return await this.stationService.getAllStation({
        page,
        limit,
        latitude: latitude ? Number(latitude) : undefined,
        longitude: longitude ? Number(longitude) : undefined,
        status: isAdmin ? data.status ?? undefined : StationStatus.Active,
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
      } as StationListResponse;
    }
  }

  @Mutation(() => StationResponse, { name: GRAPQL_NAME_STATION.UPDATE_STATUS })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  async updateStationStatus(
    @Args('body') body: UpdateStationStatusInput,
  ): Promise<StationResponse> {
    try {
      return await this.stationService.changeStationStatus(body);
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

  @Query(() => [StationSearchResult], {
    name: GRAPQL_NAME_STATION.AUTO_COMPLETE,
  })
  @UseGuards(OptionalJwtAuthGuard)
  async autoCompleteStation(
    @Args('query', { type: () => String }) query: string,
    @CurrentUser() user?: UserProfile,
  ): Promise<StationSearchResult[]> {
    try {
      return await this.stationService.autoComplete(query, user);
    } catch (error: any) {
      return [];
    }
  }

  @Query(() => StationSearchPage, { name: GRAPQL_NAME_STATION.SEARCH })
  @UseGuards(OptionalJwtAuthGuard)
  async searchStation(
    @Args('q', { nullable: true }) q: string,
    @Args('params', {
      nullable: true,
      type: () => GetStationInput,
      defaultValue: {},
    })
    data: GetStationInput,
    @CurrentUser() user?: UserProfile,
  ): Promise<StationSearchPage> {
    try {
      const page = data.page ?? 1;
      const limit = data.limit ?? 10;
      const search = q ?? '';

      return await this.stationService.searchStation(page, limit, search, user);
    } catch (error) {
      return {
        data: [],
        pagination: {
          total: 0,
          page: 1,
          limit: 10,
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
