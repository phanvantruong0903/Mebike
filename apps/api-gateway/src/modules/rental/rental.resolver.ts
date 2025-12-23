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
  Station,
  Bike,
  Rental,
  RentalResponse,
  GRAPHQL_NAME_RENTAL,
  CreateRentalInput,
  RentalListResponse,
  GetRentalListInput,
  EndRentalInput,
} from '@mebike/common';
import { RoleGuard } from '../auth/role.guard';
import { Roles } from '../auth/role.decorator';
import { RentalService } from './rental.service';
import { BikeDataloader } from './bike.dataloader';
import { StationDataloader } from '../bike/station.dataloader';

@Resolver(() => Rental)
export class RentalResolver {
  constructor(
    private readonly rentalService: RentalService,
    private readonly bikeDataLoader: BikeDataloader,
    private readonly stationDataLoader: StationDataloader,
  ) {}

  @Mutation(() => RentalResponse, { name: GRAPHQL_NAME_RENTAL.CREATE })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.USER)
  async createRental(
    @Args('body') body: CreateRentalInput,
  ): Promise<RentalResponse> {
    return this.rentalService.createRental(body);
  }

  @Mutation(() => RentalResponse, { name: GRAPHQL_NAME_RENTAL.END })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.STAFF)
  async endRental(@Args('body') body: EndRentalInput): Promise<RentalResponse> {
    return this.rentalService.endRental(body);
  }

  @Query(() => RentalResponse, { name: GRAPHQL_NAME_RENTAL.GET_ONE })
  async getRental(@Args('id') id: string): Promise<RentalResponse> {
    return this.rentalService.getRental({ id });
  }

  @Query(() => RentalListResponse, { name: GRAPHQL_NAME_RENTAL.GET_ALL })
  async getRentalList(
    @Args('params', {
      nullable: true,
      type: () => GetRentalListInput,
      defaultValue: {},
    })
    data: GetRentalListInput,
  ): Promise<RentalListResponse> {
    const page = data?.page ?? 1;
    const limit = data?.limit ?? 10;

    return this.rentalService.getRentalList({
      page,
      limit,
      search: data.search,
    });
  }

  @ResolveField(() => Bike, { nullable: true })
  async bike(@Parent() rental: Rental): Promise<Bike | null> {
    if (!rental.bike?.id) return null;
    return this.bikeDataLoader.batchBikes.load(rental.bike.id);
  }

  @ResolveField(() => Station, { nullable: true })
  async startStation(@Parent() rental: Rental): Promise<Station | null> {
    if (!rental.startStation?.id) return null;
    return this.stationDataLoader.batchStations.load(rental.startStation.id);
  }

  @ResolveField(() => Station, { nullable: true })
  async endStation(@Parent() rental: Rental): Promise<Station | null> {
    if (!rental.endStation?.id) return null;
    return this.stationDataLoader.batchStations.load(rental.endStation.id);
  }

  @Query(() => String)
  _healthCheck(): string {
    return 'API is running';
  }
}
