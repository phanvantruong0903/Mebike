import { Injectable } from '@nestjs/common';
import {
  BaseService,
  CreateProfileDto,
  UpdateProfileDto,
  prismaUser,
  Profile,
} from '@loginex/common';

@Injectable()
export class UserService extends BaseService<
  Profile,
  CreateProfileDto,
  UpdateProfileDto
> {
  constructor() {
    super(prismaUser.profile);
  }
}
