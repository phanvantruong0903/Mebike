import { Role, UserVerifyStatus } from '../prisma/user/generated';

export interface TokenPayload {
  user_id: string;
  verify: UserVerifyStatus;
  role: Role;
}
