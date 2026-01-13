import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  Role,
  CreateSosInput,
  UserProfile,
  SosResponse,
  GRAPHQL_NAME_SOS,
} from '@mebike/common';
import { RoleGuard } from '../auth/role.guard';
import { Roles } from '../auth/role.decorator';
import { SosService } from './sos.service';
import { CurrentUser } from '../auth/current-user.decorator';

@Resolver()
export class SosResolver {
  constructor(private readonly sosService: SosService) {}

  @Mutation(() => SosResponse, { name: GRAPHQL_NAME_SOS.CREATE })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.USER)
  async createSos(
    @Args('body') body: CreateSosInput,
    @CurrentUser() user: UserProfile,
  ): Promise<SosResponse> {
    const accountId = user.accountId;
    return this.sosService.createSos({ ...body, requesterId: accountId });
  }

  @Query(() => String)
  _healthCheck(): string {
    return 'API is running';
  }
}
