import { Injectable } from '@nestjs/common';
import {
  BaseService,
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
    const stats = await prismaFleet.supplier.groupBy({
      by: ['status'],
      _count: {
        id: true,
      },
    });

    const totalCount = stats.reduce(
      (acc: number, curr: any) => acc + curr._count.id,
      0,
    );

    const result = {
      totalSupplier: totalCount,
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
