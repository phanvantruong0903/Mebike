import { EmergencyStatus } from '@mebike/common';
import { registerEnumType } from '@nestjs/graphql';

registerEnumType(EmergencyStatus, {
  name: 'EmergencyStatus',
  description: 'Trạng thái của phiên SOS',
});
