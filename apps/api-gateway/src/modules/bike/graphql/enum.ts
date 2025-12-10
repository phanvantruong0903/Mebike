import { registerEnumType } from '@nestjs/graphql';
import { BikeStatus } from '@mebike/common';

registerEnumType(BikeStatus, {
  name: 'BikeStatus',
  description: 'Trạng thái của xe',
});
