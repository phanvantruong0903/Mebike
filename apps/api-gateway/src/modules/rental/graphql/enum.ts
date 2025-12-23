import { registerEnumType } from '@nestjs/graphql';
import { RentalStatus } from '@mebike/common';

registerEnumType(RentalStatus, {
  name: 'RentalStatus',
  description: 'Trạng thái của phiên thuê',
});
