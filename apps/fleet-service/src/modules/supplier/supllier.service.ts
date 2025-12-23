import { Injectable } from '@nestjs/common';
import {
  BaseService,
  BikeStatus,
  CreateSupplierDto,
  SupplierModel,
  SupplierStatus,
  UpdateSupplierDto,
  prismaFleet,
} from '@mebike/common';

@Injectable()
export class SupplierService extends BaseService<
  SupplierModel,
  CreateSupplierDto,
  UpdateSupplierDto
> {
  constructor() {
    super(prismaFleet.supplier);
  }

  async getSupplierStat() {
    const [stats, bikeStats] = await Promise.all([
      prismaFleet.supplier.groupBy({
        by: ['status'],
        _count: {
          id: true,
        },
      }),
      prismaFleet.bike.groupBy({
        by: ['status'],
        where: {
          supplierId: {
            not: undefined,
          },
        },
        _count: {
          id: true,
        },
      }),
    ]);

    const totalCount = stats.reduce(
      (acc: number, curr: any) => acc + curr._count.id,
      0,
    );

    const bikeCount = bikeStats.reduce(
      (acc: number, curr: any) => acc + curr._count.id,
      0,
    );

    const result = {
      totalSupplier: totalCount,
      totalBike: bikeCount,
      totalAvailableBike:
        bikeStats.find((item: any) => item.status === BikeStatus.Available)
          ?._count.id ?? 0,
      totalBookedBike:
        bikeStats.find((item: any) => item.status === BikeStatus.Booked)?._count
          .id ?? 0,
      totalBrokenBike:
        bikeStats.find((item: any) => item.status === BikeStatus.Broken)?._count
          .id ?? 0,
      totalReservedBike:
        bikeStats.find((item: any) => item.status === BikeStatus.Reserved)
          ?._count.id ?? 0,
      totalMaintainedBike:
        bikeStats.find((item: any) => item.status === BikeStatus.Maintained)
          ?._count.id ?? 0,
      totalUnAvailableBike:
        bikeStats.find((item: any) => item.status === BikeStatus.Unavailable)
          ?._count.id ?? 0,
      totalSupplierActive:
        stats.find((item: any) => item.status === SupplierStatus.Active)?._count
          .id ?? 0,
      totalSupplierInactive:
        stats.find((item: any) => item.status === SupplierStatus.Inactive)
          ?._count.id ?? 0,
    };

    return result;
  }
}
