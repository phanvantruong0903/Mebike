import { registerEnumType } from '@nestjs/graphql';
import { PackageStatus, UsageType } from '@mebike/common';

registerEnumType(PackageStatus, {
  name: 'PackageStatus',
  description: 'Trạng thái của gói',
});

registerEnumType(UsageType, {
  name: 'UsageType',
  description: 'Loại sử dụng',
});
