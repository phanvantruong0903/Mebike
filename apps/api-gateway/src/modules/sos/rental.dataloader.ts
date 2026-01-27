import DataLoader from 'dataloader';
import { Injectable } from '@nestjs/common';
import { RentalService } from '../rental/rental.service';
import { Rental } from '@mebike/common';

@Injectable()
export class RentalDataloader {
  constructor(private readonly rentalService: RentalService) {}

  public readonly batchRentals = new DataLoader<string, Rental>(
    async (ids: readonly string[]) => {
      const rentals = await this.rentalService.getRentalByIds(ids as string[]);

      const rentalsMap = new Map(rentals.map((p) => [p.id, p]));

      return ids.map(
        (id) =>
          rentalsMap.get(id) || new Error(`Rental not found for id ${id}`),
      );
    },
  );
}
