import DataLoader from 'dataloader';
import { Injectable } from '@nestjs/common';
import { BikeService } from '../bike/bike.service';
import { Bike } from '@mebike/common';

@Injectable()
export class BikeDataloader {
  constructor(private readonly bikeService: BikeService) {}

  public readonly batchBikes = new DataLoader<string, Bike>(
    async (ids: readonly string[]) => {
      const bikes = await this.bikeService.getBikeByIds(ids as string[]);

      const accountsMap = new Map(bikes.map((p) => [p.id, p]));

      return ids.map(
        (id) => accountsMap.get(id) || new Error(`Bike not found for id ${id}`),
      );
    },
  );
}
