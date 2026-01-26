import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
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
  UserProfile,
} from '@mebike/common';
import type { RentalModel } from '@mebike/common';
import { RoleGuard } from '../auth/role.guard';
import { Roles } from '../auth/role.decorator';
import { RentalService } from './rental.service';
import { BikeDataloader } from './bike.dataloader';
import { StationDataloader } from '../bike/station.dataloader';
import { CurrentUser } from '../auth/current-user.decorator';
import { UserProfileDataLoader } from '../user/user-profile.dataloader';

@Resolver(() => Rental)
export class RentalResolver {
  constructor(
    private readonly rentalService: RentalService,
    private readonly bikeDataLoader: BikeDataloader,
    private readonly stationDataLoader: StationDataloader,
    private readonly userProfileDataLoader: UserProfileDataLoader,
  ) {}

  @Mutation(() => RentalResponse, { name: GRAPHQL_NAME_RENTAL.CREATE })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.USER)
  async createRental(
    @CurrentUser() user: UserProfile,
    @Args('body') body: CreateRentalInput,
  ): Promise<RentalResponse> {
    try {
      return plainToInstance(
        RentalResponse,
        await this.rentalService.createRental({
          ...body,
          accountId: user.accountId,
        }),
      );
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

  @Mutation(() => RentalResponse, { name: GRAPHQL_NAME_RENTAL.END })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.STAFF)
  async endRental(
    @CurrentUser() user: UserProfile,
    @Args('body') body: EndRentalInput,
  ): Promise<RentalResponse> {
    try {
      return plainToInstance(
        RentalResponse,
        await this.rentalService.endRental({
          ...body,
          accountId: user.accountId,
        }),
      );
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

  @Query(() => RentalResponse, { name: GRAPHQL_NAME_RENTAL.GET_ONE })
  async getRental(@Args('id') id: string): Promise<RentalResponse> {
    try {
      return plainToInstance(
        RentalResponse,
        await this.rentalService.getRental({ id }),
      );
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

  @Query(() => RentalListResponse, { name: GRAPHQL_NAME_RENTAL.GET_ALL })
  async getRentalList(
    @Args('params', {
      nullable: true,
      type: () => GetRentalListInput,
      defaultValue: {},
    })
    data: GetRentalListInput,
  ): Promise<RentalListResponse> {
    try {
      const page = data?.page ?? 1;
      const limit = data?.limit ?? 10;

      return plainToInstance(
        RentalListResponse,
        await this.rentalService.getRentalList({
          page,
          limit,
          search: data.search,
        }),
      );
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
      } as RentalListResponse;
    }
  }

  @ResolveField(() => UserProfile, { nullable: true })
  async user(@Parent() rental: RentalModel): Promise<UserProfile | null> {
    if (!rental.accountId) return null;
    return this.userProfileDataLoader.batchUserProfiles.load(rental.accountId);
  }

  @ResolveField(() => Bike, { nullable: true })
  async bike(@Parent() rental: RentalModel): Promise<Bike | null> {
    if (!rental.bikeId) return null;
    return this.bikeDataLoader.batchBikes.load(rental.bikeId);
  }

  @ResolveField(() => Station, { nullable: true })
  async startStation(@Parent() rental: RentalModel): Promise<Station | null> {
    if (!rental.startStationId) return null;
    return this.stationDataLoader.batchStations.load(rental.startStationId);
  }

  @ResolveField(() => Station, { nullable: true })
  async endStation(@Parent() rental: RentalModel): Promise<Station | null> {
    if (!rental.endStationId) return null;
    return this.stationDataLoader.batchStations.load(rental.endStationId);
  }

  @Query(() => String)
  _healthCheck(): string {
    return 'API is running';
  }
}
