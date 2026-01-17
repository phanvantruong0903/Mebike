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
  BikeListResponse,
  GetBikeInput,
  Station,
  Bike,
  Supplier,
  BikeStatus,
  BikeSearchResult,
  BikeSearchPage,
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
    });
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

    return this.bikeService.getAllBike({
      page,
      limit,
      search: data.search,
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
    if (!bike.station?.id) return null;
    return this.stationDataloader.batchStations.load(bike.station.id);
  }

  @ResolveField(() => Supplier, { nullable: true })
  async supplier(@Parent() bike: Bike): Promise<Supplier | null> {
    if (!bike.supplier?.id) return null;
    return this.supplierDataloader.batchSupplier.load(bike.supplier.id);
  }

  @Query(() => [BikeSearchResult], { name: GRAPHQL_NAME_BIKE.AUTO_COMPLETE })
  async autoCompleteBike(
    @Args('query', { type: () => String }) query: string,
  ): Promise<BikeSearchResult[]> {
    return this.bikeService.autoComplete(query);
  }

  @Query(() => BikeSearchPage, { name: GRAPHQL_NAME_BIKE.SEARCH })
  async searchBike(
    @Args('params', {
      nullable: true,
      type: () => GetBikeInput,
      defaultValue: {},
    })
    data: GetBikeInput,
  ): Promise<BikeSearchPage> {
    const page = data.page ?? 1;
    const limit = data.limit ?? 10;
    const search = data.search ?? '';

    return this.bikeService.searchBike(page, limit, search);
  }

  @Query(() => String)
  _healthCheck(): string {
    return 'API is running';
  }
}
