import { registerEnumType } from '@nestjs/graphql';
import { SubscriptionStatus } from '@mebike/common';

registerEnumType(SubscriptionStatus, {
  name: 'SubscriptionStatus',
  description: 'Trạng thái của gói tháng',
});
