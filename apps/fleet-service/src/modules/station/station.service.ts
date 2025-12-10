import { Injectable } from '@nestjs/common';
import {
  BaseService,
  CreateStationDto,
  prismaFleet,
  StationModel,
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
}
