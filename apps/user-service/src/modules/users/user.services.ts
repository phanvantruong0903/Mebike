import { Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import {
  BaseService,
  CreateProfileDto,
  UpdateProfileDto,
  prismaUser,
  Profile,
  Role,
  UserVerifyStatus,
  throwGrpcError,
  USER_MESSAGES,
  SERVER_MESSAGE,
  UserStatus,
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
      totalUsers: stats.reduce((acc, curr) => acc + curr._count.id, 0),
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
  async userVerify(data: { accountId: string }) {
    const updatedProfile = await prismaUser.profile.update({
      where: { accountId: data.accountId },
      data: { verify: UserVerifyStatus.Verified },
    });
    return updatedProfile;
  }

  async updateProfile(id: string, data: Omit<UpdateProfileDto, 'id'>) {
    try {
      const result = await prismaUser.profile.update({
        where: { accountId: id },
        data,
      });
      return result;
    } catch (error: any) {
      if (error?.code === 'P2002') {
        const fields: string[] = error.meta?.target ?? [];
        const messages = fields.map((field) => {
          switch (field) {
            case 'email':
              return USER_MESSAGES.EMAIL_EXISTED;
            default:
              return `${field} existed`;
          }
        });
        throwGrpcError(409, SERVER_MESSAGE.UNIQUE_CONSTRAINT_FAILED, messages);
      }

      if (error?.code === 'P2003') {
        const field = error.meta?.field_name ?? 'relation';
        throwGrpcError(400, SERVER_MESSAGE.FOREIGN_KEY_FAILED, [
          SERVER_MESSAGE.FOREIGN_KEY_INVALID(field),
        ]);
      }

      if (error?.code === 'P2025') {
        throwGrpcError(404, USER_MESSAGES.NOT_FOUND, [USER_MESSAGES.NOT_FOUND]);
      }
      if (error instanceof RpcException) {
        throw error;
      }
      const err = error as Error;
      throw new RpcException(err?.message || USER_MESSAGES.UPDATE_FAIL);
    }
  }

  async getUserDetail(id: string) {
    const result = await prismaUser.profile.findUnique({
      where: { accountId: id },
    });
    if (!result) {
      throwGrpcError(404, USER_MESSAGES.NOT_FOUND, [USER_MESSAGES.NOT_FOUND]);
    }

    return result;
  }

  async deleteUser(accountId: string) {
    try {
      await prismaUser.profile.delete({
        where: { accountId },
      });
      return null;
    } catch (error: any) {
      if (error?.code === 'P2025') {
        throwGrpcError(404, USER_MESSAGES.NOT_FOUND, [USER_MESSAGES.NOT_FOUND]);
      }
      if (error instanceof RpcException) {
        throw error;
      }
      const err = error as Error;
      throwGrpcError(400, err?.message || USER_MESSAGES.DELETE_FAILED, [
        err.message,
      ]);
    }
  }

  async changeUserStatus(accountId: string, status: UserStatus) {
    const profile = await prismaUser.profile.update({
      where: { accountId },
      data: { status },
    });
    return profile;
  }
}
