import { Injectable } from '@nestjs/common';
import {
  BaseService,
  CreateSupplierDto,
  Supplier,
  SupplierStatus,
  UpdateSupplierDto,
  prismaFleet,
} from '@mebike/common';

@Injectable()
export class SupplierService extends BaseService<
  Supplier,
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

    const totalCount = stats.reduce((acc, curr) => acc + curr._count.id, 0);

    const result = {
      totalSupplier: totalCount,
      totalSupplierActive:
        stats.find((item) => item.status === SupplierStatus.Active)?._count
          .id ?? 0,
      totalSupplierInactive:
        stats.find((item) => item.status === SupplierStatus.Inactive)?._count
          .id ?? 0,
    };

    return result;
  }
}
