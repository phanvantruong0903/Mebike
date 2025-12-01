import {
  BaseService,
  CreateWarehouseDto,
  WAREHOUSE_MESSAGES,
  prismaInventory,
  UpdateWarehouseDto,
  WareHouse,
  WarehouseStatus,
} from '@loginex/common';
import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class WarehouseService extends BaseService<
  WareHouse,
  CreateWarehouseDto,
  UpdateWarehouseDto
> {
  constructor() {
    super(prismaInventory.wareHouse);
  }

  override async changeStatus(
    id: string,
    fromStatus: WarehouseStatus,
    toStatus: WarehouseStatus,
  ): Promise<WareHouse> {
    const warehouse = await this.model.findUnique({
      where: { id, status: fromStatus },
    });
    if (!warehouse) {
      throw new NotFoundException(
        fromStatus === WarehouseStatus.ACTIVE
          ? WAREHOUSE_MESSAGES.ACTIVE_WAREHOUSE_NOT_FOUND
          : WAREHOUSE_MESSAGES.INACTIVE_WAREHOUSE_NOT_FOUND,
      );
    }

    return this.model.update({
      where: { id, status: fromStatus },
      data: { status: toStatus },
    });
  }

  async inactivate(id: string): Promise<WareHouse> {
    return this.changeStatus(
      id,
      WarehouseStatus.ACTIVE,
      WarehouseStatus.INACTIVE,
    );
  }

  async activate(id: string): Promise<WareHouse> {
    return this.changeStatus(
      id,
      WarehouseStatus.INACTIVE,
      WarehouseStatus.ACTIVE,
    );
  }
}
