import { Injectable } from '@nestjs/common';
import {
  BaseService,
  BikeModel,
  CreateBikeDto,
  UpdateBikeDto,
  prismaFleet,
} from '@mebike/common';

@Injectable()
export class BikeService extends BaseService<
  BikeModel,
  CreateBikeDto,
  UpdateBikeDto
> {
  constructor() {
    super(prismaFleet.bike);
  }
}
