import { Injectable } from '@nestjs/common';
import {
  BaseService,
  CreateProfileDto,
  UpdateProfileDto,
  prismaUser,
  Profile,
  Role,
  UserVerifyStatus,
} from '@mebike/common';

@Injectable()
export class UserService extends BaseService<
  Profile,
  CreateProfileDto,
  UpdateProfileDto
> {
  constructor() {
    super(prismaUser.profile);
  }

  async getUserStat() {
    const stats = await prismaUser.profile.groupBy({
      by: ['role', 'verify'],
      _count: {
        id: true,
      },
    });

    const countTotalByRole = (role: Role) => {
      return stats
        .filter((item) => item.role === role)
        .reduce((acc, curr) => acc + curr._count.id, 0);
    };

    const result = {
      totalUsers: stats.length,
      totalUser: countTotalByRole(Role.USER),
      totalUserUnverfied:
        stats.find(
          (item) =>
            item.role === Role.USER &&
            item.verify === UserVerifyStatus.Unverified,
        )?._count.id ?? 0,
      totalStaff: countTotalByRole(Role.STAFF),
      totalAdmin: countTotalByRole(Role.ADMIN),
      totalSos: countTotalByRole(Role.SOS),
    };

    return result;
  }
}
