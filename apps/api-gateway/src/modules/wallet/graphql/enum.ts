import { registerEnumType } from '@nestjs/graphql';
import { WalletStatus } from '@mebike/common';

registerEnumType(WalletStatus, {
  name: 'WalletStatus',
  description: 'Trạng thái của ví',
});
