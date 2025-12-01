import { registerEnumType } from '@nestjs/graphql';
import { Role, UserVerifyStatus, UserStatus } from '@loginex/common';

registerEnumType(Role, {
  name: 'Role',
  description: 'Vai trò của người dùng',
});

registerEnumType(UserVerifyStatus, {
  name: 'UserVerifyStatus',
  description: 'Trạng thái xác thực của người dùng',
});

registerEnumType(UserStatus, {
  name: 'UserStatus',
  description: 'Trạng thái của người dùng',
});
