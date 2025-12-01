import { registerEnumType } from '@nestjs/graphql';
import { ProductStatus } from '@loginex/common';

registerEnumType(ProductStatus, {
  name: 'ProductStatus',
  description: 'Trạng thái của hàng hóa',
});
