import { registerEnumType } from '@nestjs/graphql';
import {
  PaymentMethod,
  TransactionStatus,
  TransactionType,
  WithdrawStatus,
} from '@mebike/common';

registerEnumType(PaymentMethod, {
  name: 'PaymentMethod',
  description: 'Phương thức thanh toán',
});

registerEnumType(TransactionStatus, {
  name: 'TransactionStatus',
  description: 'Trạng thái giao dịch',
});

registerEnumType(TransactionType, {
  name: 'TransactionType',
  description: 'Loại giao dịch',
});

registerEnumType(WithdrawStatus, {
  name: 'WithdrawStatus',
  description: 'Trạng thái rút tiền',
});
