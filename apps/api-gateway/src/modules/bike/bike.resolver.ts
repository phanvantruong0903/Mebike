import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard';
import {
  Role,
  BikeResponse,
  CreateBikeInput,
  GRAPHQL_NAME_BIKE,
  UpdateBikeInput,
  UpdateBikeDto,
  BikeListResponse,
  GetBikeInput,
  Station,
  Bike,
  Supplier,
  BikeStatus,
  BikeSearchResult,
  BikeSearchPage,
  BikeResult,
  UserProfile,
} from '@mebike/common';
import { RoleGuard } from '../auth/role.guard';
import { Roles } from '../auth/role.decorator';
import { BikeService } from './bike.service';
import { StationDataloader } from './station.dataloader';
import { SupplierDataloader } from './supplier.dataloader';
import { CurrentUser } from '../auth/current-user.decorator';

@Resolver(() => Bike)
export class BikeResolver {
  constructor(
    private readonly bikeService: BikeService,
    private readonly stationDataloader: StationDataloader,
    private readonly supplierDataloader: SupplierDataloader,
  ) {}

  @Mutation(() => BikeResponse, { name: GRAPHQL_NAME_BIKE.CREATE })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  async createBike(@Args('body') body: CreateBikeInput): Promise<BikeResponse> {
    try {
      return await this.bikeService.createBike(body);
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

  @Mutation(() => BikeResponse, { name: GRAPHQL_NAME_BIKE.UPDATE })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  async updateBike(
    @Args('body') body: UpdateBikeInput,
    @Args('id') id: string,
  ): Promise<BikeResponse> {
    try {
      return await this.bikeService.updateBike({
        id,
        ...body,
      } as unknown as UpdateBikeDto);
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

  @Query(() => BikeResponse, { name: GRAPHQL_NAME_BIKE.GET_ONE })
  async getBike(@Args('id') id: string): Promise<BikeResponse> {
    try {
      return await this.bikeService.getBike({ id });
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

  @Query(() => BikeListResponse, { name: GRAPHQL_NAME_BIKE.GET_ALL })
  @UseGuards(OptionalJwtAuthGuard)
  async getAllBike(
    @Args('params', {
      nullable: true,
      type: () => GetBikeInput,
      defaultValue: {},
    })
    data: GetBikeInput,
    @CurrentUser() user?: UserProfile,
  ): Promise<BikeListResponse> {
    try {
      const page = data?.page ?? 1;
      const limit = data?.limit ?? 10;

      const status = data?.status;
      let stationId = data?.stationId;

      if (user?.role === Role.STAFF && user?.workStationId) {
        stationId = user.workStationId;
      }

      return await this.bikeService.getAllBike({
        page,
        limit,
        status,
        stationId,
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
          page: data?.page ?? 1,
          limit: data?.limit ?? 10,
          totalPages: 0,
        },
      } as BikeListResponse;
    }
  }

  @Mutation(() => BikeResponse, { name: GRAPHQL_NAME_BIKE.CHANGE_STATUS })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  async changeBikeStatus(
    @Args('id') id: string,
    @Args('status', { type: () => BikeStatus }) status: BikeStatus,
  ): Promise<BikeResponse> {
    try {
      return await this.bikeService.changeBikeStatus({ id, status });
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

  @ResolveField(() => Station, { nullable: true })
  async station(@Parent() bike: Bike): Promise<Station | null> {
    if (!bike.station?.id) return null;
    return this.stationDataloader.batchStations.load(bike.station.id);
  }

  @ResolveField(() => Supplier, { nullable: true })
  async supplier(@Parent() bike: Bike): Promise<Supplier | null> {
    if (!bike.supplier?.id) return null;
    return this.supplierDataloader.batchSupplier.load(bike.supplier.id);
  }

  @Query(() => BikeSearchResult, { name: GRAPHQL_NAME_BIKE.AUTO_COMPLETE })
  async autoCompleteBike(
    @Args('query', { type: () => String }) query: string,
  ): Promise<BikeSearchResult> {
    try {
      return await this.bikeService.autoComplete(query);
    } catch (error) {
      console.error(error);

      return {
        data: [],
      };
    }
  }

  @Query(() => BikeSearchPage, { name: GRAPHQL_NAME_BIKE.SEARCH })
  async searchBike(
    @Args('q', { nullable: true }) q: string,
    @Args('params', {
      nullable: true,
      type: () => GetBikeInput,
      defaultValue: {},
    })
    data: GetBikeInput,
  ): Promise<BikeSearchPage> {
    try {
      const page = data?.page ?? 1;
      const limit = data?.limit ?? 10;
      const search = q ?? '';

      return await this.bikeService.searchBike(page, limit, search);
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

@Resolver(() => BikeResult)
export class BikeResultResolver {
  constructor(
    private readonly stationDataloader: StationDataloader,
    private readonly supplierDataloader: SupplierDataloader,
  ) {}

  @ResolveField(() => Station, { nullable: true })
  async station(@Parent() bike: BikeResult): Promise<Station | null> {
    if (!bike.stationId) return null;
    return this.stationDataloader.batchStations.load(bike.stationId);
  }

  @ResolveField(() => Supplier, { nullable: true })
  async supplier(@Parent() bike: BikeResult): Promise<Supplier | null> {
    if (!bike.supplierId) return null;
    return this.supplierDataloader.batchSupplier.load(bike.supplierId);
  }
}
