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
  CreateSosInput,
  CreateSosDto,
  UserProfile,
  SosResponse,
  GRAPHQL_NAME_SOS,
  UpdateSosInput,
  GetSosInput,
  SosListResponse,
  Sos,
  Bike,
  Station,
  Rental,
  UpdateSosDto,
} from '@mebike/common';
import { RoleGuard } from '../auth/role.guard';
import { Roles } from '../auth/role.decorator';
import { SosService } from './sos.service';
import { CurrentUser } from '../auth/current-user.decorator';
import { UserProfileDataloader } from './user-profile.dataloader';
import { BikeDataloader } from './bike.dataloader';
import { StationDataloader } from './station.dataloader';
import { RentalDataloader } from './rental.dataloader';

@Resolver(() => Sos)
export class SosResolver {
  constructor(
    private readonly sosService: SosService,
    private readonly dataloader: UserProfileDataloader,
    private readonly bikeDataloader: BikeDataloader,
    private readonly stationDataloader: StationDataloader,
    private readonly rentalDataloader: RentalDataloader,
  ) {}

  @Mutation(() => SosResponse, { name: GRAPHQL_NAME_SOS.CREATE })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.USER)
  async createSos(
    @Args('body') body: CreateSosInput,
    @CurrentUser() user: UserProfile,
  ): Promise<SosResponse> {
    try {
      return await this.sosService.createSos({
        ...body,
        requesterId: user.accountId,
      } as unknown as CreateSosDto);
    } catch (error) {
      const err = error as any;
      const statusCode =
        err?.status ?? err?.statusCode ?? err?.extensions?.statusCode ?? 500;
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

  @Mutation(() => SosResponse, { name: GRAPHQL_NAME_SOS.UPDATE_STATUS })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.USER, Role.SOS, Role.ADMIN)
  async updateSos(
    @Args('body') body: UpdateSosInput,
    @CurrentUser() user: UserProfile,
  ): Promise<SosResponse> {
    try {
      return await this.sosService.updateSosStatus({
        ...body,
        accountId: user.accountId,
        role: user.role,
      } as unknown as UpdateSosDto);
    } catch (error) {
      const err = error as any;
      const statusCode =
        err?.status ?? err?.statusCode ?? err?.extensions?.statusCode ?? 500;
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

  @Query(() => SosListResponse, { name: GRAPHQL_NAME_SOS.GET_ALL })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.USER, Role.SOS, Role.ADMIN)
  async getAllSos(
    @Args('params', {
      nullable: true,
      type: () => GetSosInput,
      defaultValue: {},
    })
    data: GetSosInput,
    @CurrentUser() user: UserProfile,
  ): Promise<SosListResponse> {
    try {
      const page = data?.page ?? 1;
      const limit = data?.limit ?? 10;

      const status = data?.status;

      return await this.sosService.getAllSos(
        {
          page,
          limit,
          status,
        },
        user,
      );
    } catch (error) {
      const err = error as any;
      const statusCode =
        err?.status ?? err?.statusCode ?? err?.extensions?.statusCode ?? 500;
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
      } as SosListResponse;
    }
  }

  @Query(() => SosResponse, { name: GRAPHQL_NAME_SOS.GET_ONE })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.USER, Role.SOS, Role.ADMIN)
  async getSos(
    @Args('id') id: string,
    @CurrentUser() user: UserProfile,
  ): Promise<SosResponse> {
    try {
      return await this.sosService.getSos({ id }, user);
    } catch (error) {
      const err = error as any;
      const statusCode =
        err?.status ?? err?.statusCode ?? err?.extensions?.statusCode ?? 500;
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

  @ResolveField(() => UserProfile)
  async agent(@Parent() sos: Sos): Promise<UserProfile> {
    return this.dataloader.batchUserProfiles.load(sos.agentId);
  }

  @ResolveField(() => UserProfile)
  async requester(@Parent() sos: Sos): Promise<UserProfile> {
    return this.dataloader.batchUserProfiles.load(sos.requesterId);
  }

  @ResolveField(() => Bike)
  async bike(@Parent() sos: Sos): Promise<Bike> {
    return this.bikeDataloader.batchBikes.load(sos.bikeId);
  }

  @ResolveField(() => Station)
  async station(@Parent() sos: Sos): Promise<Station> {
    return this.stationDataloader.batchStations.load(sos.stationId);
  }

  @ResolveField(() => Rental)
  async rental(@Parent() sos: Sos): Promise<Rental> {
    return this.rentalDataloader.batchRentals.load(sos.rentalId);
  }

  @Query(() => String)
  _healthCheck(): string {
    return 'API is running';
  }
}
