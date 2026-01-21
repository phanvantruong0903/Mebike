import DataLoader from 'dataloader';
import { Injectable } from '@nestjs/common';
import { StationService } from '../station/station.service';
import { Station } from '@mebike/common';

@Injectable()
export class StationDataloader {
  constructor(private readonly stationService: StationService) {}

  public readonly batchStations = new DataLoader<string, Station>(
    async (ids: readonly string[]) => {
      const stations = await this.stationService.getStationByIds(
        ids as string[],
      );

      const accountsMap = new Map(stations.map((p) => [p.id, p]));

      return ids.map(
        (id) =>
          accountsMap.get(id) || new Error(`Station not found for id ${id}`),
      );
    },
  );
}
