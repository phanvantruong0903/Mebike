import DataLoader from 'dataloader';
import { Injectable, Scope } from '@nestjs/common';
import { PackageService } from './package.service';
import { Package } from '@mebike/common';

@Injectable({ scope: Scope.REQUEST })
export class PackageDataloader {
  constructor(private readonly packageService: PackageService) {}

  public readonly batchPackages = new DataLoader<string, Package>(
    async (ids: readonly string[]) => {
      const packages = await this.packageService.getPackagesByIds(
        ids as string[],
      );

      const packagesMap = new Map(packages.map((p) => [p.id, p]));
      return ids.map(
        (id) =>
          packagesMap.get(id) || new Error(`Package not found for id ${id}`),
      );
    },
  );
}
