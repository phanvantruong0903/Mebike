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
import type { ReservationModel } from '@mebike/common';
import {
  Role,
  Station,
  Bike,
  UserProfile,
  GRAPHQL_NAME_RESERVATION,
  ReservationResponse,
  CreateReservationInput,
  ActivateReservationInput,
  ReservationListResponse,
  GetReservationListInput,
  Reservation,
} from '@mebike/common';
import { RoleGuard } from '../auth/role.guard';
import { Roles } from '../auth/role.decorator';
import { BikeDataloader } from './bike.dataloader';
import { StationDataloader } from '../bike/station.dataloader';
import { CurrentUser } from '../auth/current-user.decorator';
import { ReservationService } from './reservation.service';
import { UserProfileDataLoader } from '../user/user-profile.dataloader';

@Resolver(() => Reservation)
export class ReservationResolver {
  constructor(
    private readonly reservationService: ReservationService,
    private readonly bikeDataLoader: BikeDataloader,
    private readonly stationDataLoader: StationDataloader,
    private readonly userProfileDataLoader: UserProfileDataLoader,
  ) {}

  @Mutation(() => ReservationResponse, {
    name: GRAPHQL_NAME_RESERVATION.CREATE,
  })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.USER)
  async createReservation(
    @CurrentUser() user: UserProfile,
    @Args('body') body: CreateReservationInput,
  ): Promise<ReservationResponse> {
    try {
      return plainToInstance(
        ReservationResponse,
        await this.reservationService.createReservation({
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

  @Mutation(() => ReservationResponse, {
    name: GRAPHQL_NAME_RESERVATION.ACTIVATE,
  })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.USER)
  async activateReservation(
    @CurrentUser() user: UserProfile,
    @Args('body') body: ActivateReservationInput,
  ): Promise<ReservationResponse> {
    try {
      return plainToInstance(
        ReservationResponse,
        await this.reservationService.activateReservation({
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

  @Query(() => ReservationResponse, { name: GRAPHQL_NAME_RESERVATION.GET_ONE })
  async getReservation(@Args('id') id: string): Promise<ReservationResponse> {
    try {
      return plainToInstance(
        ReservationResponse,
        await this.reservationService.getReservation({ id }),
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

  @Query(() => ReservationListResponse, {
    name: GRAPHQL_NAME_RESERVATION.GET_ALL,
  })
  async getReservationList(
    @Args('params', {
      nullable: true,
      type: () => GetReservationListInput,
      defaultValue: {},
    })
    data: GetReservationListInput,
  ): Promise<ReservationListResponse> {
    try {
      const page = data?.page ?? 1;
      const limit = data?.limit ?? 10;

      return plainToInstance(
        ReservationListResponse,
        await this.reservationService.getReservationList({
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
      } as ReservationListResponse;
    }
  }

  @ResolveField(() => UserProfile, { nullable: true })
  async user(
    @Parent() reservation: ReservationModel,
  ): Promise<UserProfile | null> {
    if (!reservation.accountId) return null;
    return this.userProfileDataLoader.batchUserProfiles.load(
      reservation.accountId,
    );
  }

  @ResolveField(() => Bike, { nullable: true })
  async bike(@Parent() reservation: ReservationModel): Promise<Bike | null> {
    if (!reservation.bikeId) return null;
    return this.bikeDataLoader.batchBikes.load(reservation.bikeId);
  }

  @ResolveField(() => Station, { nullable: true })
  async station(
    @Parent() reservation: ReservationModel,
  ): Promise<Station | null> {
    if (!reservation.stationId) return null;
    return this.stationDataLoader.batchStations.load(reservation.stationId);
  }

  @Query(() => String)
  _healthCheck(): string {
    return 'API is running';
  }
}
