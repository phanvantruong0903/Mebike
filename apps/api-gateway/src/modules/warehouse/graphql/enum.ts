import { registerEnumType } from '@nestjs/graphql';
import { WarehouseStatus } from '@loginex/common';

registerEnumType(WarehouseStatus, {
  name: 'WarehouseStatus',
  description: 'Trạng thái của kho hàng',
});
