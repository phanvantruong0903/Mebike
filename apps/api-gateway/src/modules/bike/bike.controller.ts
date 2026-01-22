import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { BikeService } from './bike.service';
import { BikeStatus, GetBikeDto, Role, UserProfile } from '@mebike/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@ApiTags('bike')
@Controller('/api/bike')
export class BikeController {
  constructor(private readonly bikeService: BikeService) {}

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({
    summary: 'Get all bikes',
    description: 'Retrieve a paginated list of bikes with optional filters',
  })
  @ApiResponse({ status: 200, description: 'Successfully retrieved bikes' })
  async getAllBikes(
    @Query() query: GetBikeDto,
    @CurrentUser() user?: UserProfile,
  ) {
    let stationId = query.stationId;
    if (user?.role === Role.STAFF && user?.workStationId) {
      stationId = user.workStationId;
    }
    let status: BikeStatus | undefined = BikeStatus.Available;
    if (user?.role !== Role.USER && user?.role) {
      status = query.status;
    }
    const data: GetBikeDto = {
      page: query.page ? Number(query.page) : 1,
      limit: query.limit ? Number(query.limit) : 10,
      status,
      stationId,
      supplierId: query.supplierId,
    };

    console.log(data);

    return this.bikeService.getAllBike(data);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get bike by ID',
    description: 'Retrieve detailed information about a specific bike',
  })
  @ApiParam({ name: 'id', description: 'Bike ID' })
  @ApiResponse({ status: 200, description: 'Successfully retrieved bike' })
  async getBike(@Param('id') id: string) {
    return this.bikeService.getBike({ id });
  }
}
