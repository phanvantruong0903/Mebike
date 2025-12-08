import { registerEnumType } from '@nestjs/graphql';
import { SupplierStatus } from '@mebike/common';

registerEnumType(SupplierStatus, {
  name: 'SupplierStatus',
  description: 'Trạng thái của nhà cung cấp',
});
