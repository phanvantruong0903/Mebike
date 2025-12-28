import { Injectable } from '@nestjs/common';
import {
  BaseService,
  CreateStationDto,
  prismaFleet,
  StationModel,
  StationStatus,
  UpdateStationDto,
} from '@mebike/common';

@Injectable()
export class StationService extends BaseService<
  StationModel,
  CreateStationDto,
  UpdateStationDto
> {
  constructor() {
    super(prismaFleet.station);
  }

  async getStationStats() {
    const [activeStation, inactiveStation] = await Promise.all([
      prismaFleet.station.count({
        where: {
          status: StationStatus.Active,
        },
      }),
      prismaFleet.station.count({
        where: {
          status: StationStatus.Inactive,
        },
      }),
    ]);
    return {
      activeStation,
      inactiveStation,
    };
  }
}
