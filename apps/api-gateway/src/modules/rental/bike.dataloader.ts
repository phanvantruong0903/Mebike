import DataLoader from 'dataloader';
import { Injectable, Scope } from '@nestjs/common';
import { Bike } from '@mebike/common';
import { BikeService } from '../bike/bike.service';

@Injectable({ scope: Scope.REQUEST })
export class BikeDataloader {
  constructor(private readonly bikeService: BikeService) {}

  public readonly batchBikes = new DataLoader<string, Bike>(
    async (ids: readonly string[]) => {
      const bikes = await this.bikeService.getBikeByIds(ids as string[]);

      const bikesMap = new Map(bikes.map((p) => [p.id, p]));
      return ids.map(
        (id) => bikesMap.get(id) || new Error(`Bike not found for id ${id}`),
      );
    },
  );
}
