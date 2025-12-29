import { registerEnumType } from '@nestjs/graphql';
import { StationStatus } from '@mebike/common';

registerEnumType(StationStatus, {
  name: 'StationStatus',
  description: 'Trạng thái của trạm',
});
