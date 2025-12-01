import { registerEnumType } from '@nestjs/graphql';
import { ZoneType } from '@loginex/common';

registerEnumType(ZoneType, {
  name: 'ZoneType',
  description: 'Loại khu vực',
});
