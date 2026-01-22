import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { StationService } from './station.service';
import {
  GetStationDto,
  Role,
  StationStatus,
  UserProfile,
} from '@mebike/common';
import { CurrentUser } from '../auth/current-user.decorator';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard';

@ApiTags('station')
@Controller('/api/station')
export class StationController {
  constructor(private readonly stationService: StationService) {}

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({
    summary: 'Get all stations',
    description:
      'Retrieve a paginated list of stations. Non-admin users only see active stations.',
  })
  @ApiResponse({ status: 200, description: 'Successfully retrieved stations' })
  @ApiBearerAuth()
  async getAllStation(
    @Query() query: GetStationDto,
    @CurrentUser() user?: UserProfile,
  ) {
    const isAdmin = user?.role === Role.ADMIN && user?.role;

    const data: GetStationDto = {
      page: query.page ? Number(query.page) : 1,
      limit: query.limit ? Number(query.limit) : 10,
      latitude: query.latitude ? Number(query.latitude) : undefined,
      longitude: query.longitude ? Number(query.longitude) : undefined,
      status: isAdmin ? query.status : StationStatus.Active,
    };

    return this.stationService.getAllStation(data);
  }

  @Get(':id')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({
    summary: 'Get station by ID',
    description: 'Retrieve detailed information about a specific station',
  })
  @ApiParam({ name: 'id', description: 'Station ID' })
  @ApiResponse({ status: 200, description: 'Successfully retrieved station' })
  @ApiResponse({ status: 404, description: 'Station not found' })
  @ApiBearerAuth()
  async getStation(@Param('id') id: string, @CurrentUser() user?: UserProfile) {
    return this.stationService.getStation({ id }, user);
  }
}
