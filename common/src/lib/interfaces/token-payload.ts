import { UserVerifyStatus } from '../constants';

export interface TokenPayload {
  user_id: string;
  verify: UserVerifyStatus;
}
