import { Controller, Get, Param, Query } from '@nestjs/common';
import { BikeService } from './bike.service';
import { GetBikeDto } from '@mebike/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

@ApiTags('bike')
@Controller('/api/bike')
export class BikeController {
  constructor(private readonly bikeService: BikeService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all bikes',
    description: 'Retrieve a paginated list of bikes with optional filters',
  })
  @ApiResponse({ status: 200, description: 'Successfully retrieved bikes' })
  async getAllBikes(@Query() query: GetBikeDto) {
    const data: GetBikeDto = {
      page: query.page ? Number(query.page) : 1,
      limit: query.limit ? Number(query.limit) : 10,
      status: query.status,
      stationId: query.stationId,
      supplierId: query.supplierId,
    };

    return this.bikeService.getAllBike(data);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get bike by ID',
    description: 'Retrieve detailed information about a specific bike',
  })
  @ApiParam({ name: 'id', description: 'Bike ID' })
  @ApiResponse({ status: 200, description: 'Successfully retrieved bike' })
  @ApiResponse({ status: 404, description: 'Bike not found' })
  async getBike(@Param('id') id: string) {
    return this.bikeService.getBike({ id });
  }
}
