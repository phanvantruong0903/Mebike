import { ReservationStatus } from '@mebike/common';
import { registerEnumType } from '@nestjs/graphql';

registerEnumType(ReservationStatus, {
  name: 'ReservationStatus',
  description: 'Trạng thái của phiên đặt trước',
});
