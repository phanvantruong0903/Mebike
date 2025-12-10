import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
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
} from '@mebike/common';
import { RoleGuard } from '../auth/role.guard';
import { Roles } from '../auth/role.decorator';
import { BikeService } from './bike.service';

@Resolver()
export class BikeResolver {
  constructor(private readonly bikeService: BikeService) {}

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
    @Args('status') status: number,
  ): Promise<BikeResponse> {
    return this.bikeService.changeBikeStatus({ id, status });
  }

  @Query(() => String)
  _healthCheck(): string {
    return 'API is running';
  }
}
