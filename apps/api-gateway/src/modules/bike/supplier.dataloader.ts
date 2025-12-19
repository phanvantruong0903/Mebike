import DataLoader from 'dataloader';
import { Injectable, Scope } from '@nestjs/common';
import { Supplier } from '@mebike/common';
import { SupplierService } from '../supplier/supplier.service';

@Injectable({ scope: Scope.REQUEST })
export class SupplierDataloader {
  constructor(private readonly supplierService: SupplierService) {}

  public readonly batchSupplier = new DataLoader<string, Supplier>(
    async (ids: readonly string[]) => {
      const suppliers = await this.supplierService.getSupplierByIds(
        ids as string[],
      );

      const suppliersMap = new Map(suppliers.map((p) => [p.id, p]));
      return ids.map(
        (id) =>
          suppliersMap.get(id) || new Error(`Supplier not found for id ${id}`),
      );
    },
  );
}
