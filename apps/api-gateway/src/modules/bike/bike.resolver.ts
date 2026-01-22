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
} from '@mebike/common';
import { RoleGuard } from '../auth/role.guard';
import { Roles } from '../auth/role.decorator';
import { BikeService } from './bike.service';
import { StationDataloader } from './station.dataloader';
import { SupplierDataloader } from './supplier.dataloader';

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
    return this.bikeService.createBike(body);
  }

  @Mutation(() => BikeResponse, { name: GRAPHQL_NAME_BIKE.UPDATE })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  async updateBike(
    @Args('body') body: UpdateBikeInput,
    @Args('id') id: string,
  ): Promise<BikeResponse> {
    return this.bikeService.updateBike({
      id,
      ...body,
    } as unknown as UpdateBikeDto);
  }

  @Query(() => BikeResponse, { name: GRAPHQL_NAME_BIKE.GET_ONE })
  async getBike(@Args('id') id: string): Promise<BikeResponse> {
    return this.bikeService.getBike({ id });
  }

  @Query(() => BikeListResponse, { name: GRAPHQL_NAME_BIKE.GET_ALL })
  async getAllBike(
    @Args('params', {
      nullable: true,
      type: () => GetBikeInput,
      defaultValue: {},
    })
    data: GetBikeInput,
  ): Promise<BikeListResponse> {
    const page = data?.page ?? 1;
    const limit = data?.limit ?? 10;

    const status = data?.status;
    const stationId = data?.stationId;

    return this.bikeService.getAllBike({
      page,
      limit,
      status,
      stationId,
    });
  }

  @Mutation(() => BikeResponse, { name: GRAPHQL_NAME_BIKE.CHANGE_STATUS })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  async changeBikeStatus(
    @Args('id') id: string,
    @Args('status', { type: () => BikeStatus }) status: BikeStatus,
  ): Promise<BikeResponse> {
    return this.bikeService.changeBikeStatus({ id, status });
  }

  @ResolveField(() => Station, { nullable: true })
  async station(@Parent() bike: Bike): Promise<Station | null> {
    if (bike.station && Object.keys(bike.station).length > 1) {
      return bike.station;
    }
    const stationId = bike.stationId || bike.station?.id;
    if (!stationId) return null;
    return this.stationDataloader.batchStations.load(stationId);
  }

  @ResolveField(() => Supplier, { nullable: true })
  async supplier(@Parent() bike: Bike): Promise<Supplier | null> {
    if (bike.supplier && Object.keys(bike.supplier).length > 1) {
      return bike.supplier;
    }
    const supplierId = bike.supplierId || bike.supplier?.id;
    if (!supplierId) return null;
    return this.supplierDataloader.batchSupplier.load(supplierId);
  }

  @Query(() => BikeSearchResult, { name: GRAPHQL_NAME_BIKE.AUTO_COMPLETE })
  async autoCompleteBike(
    @Args('query', { type: () => String }) query: string,
  ): Promise<BikeSearchResult> {
    return this.bikeService.autoComplete(query);
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
    const page = data.page ?? 1;
    const limit = data.limit ?? 10;
    const search = q ?? '';

    return this.bikeService.searchBike(page, limit, search);
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
    if (bike.stationId) {
      return this.stationDataloader.batchStations.load(bike.stationId);
    }
    return null;
  }

  @ResolveField(() => Supplier, { nullable: true })
  async supplier(@Parent() bike: BikeResult): Promise<Supplier | null> {
    if (bike.supplierId) {
      return this.supplierDataloader.batchSupplier.load(bike.supplierId);
    }
    return null;
  }
}
