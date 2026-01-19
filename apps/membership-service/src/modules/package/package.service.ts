import {
  BaseService,
  CreatePackageDto,
  PACKAGE_MESSAGES,
  PackageModel,
  PackageStatus,
  prismaMembership,
  SERVER_MESSAGE,
  throwGrpcError,
  UpdatePackageDto,
  UsageType,
} from '@mebike/common';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PackageService extends BaseService<
  PackageModel,
  CreatePackageDto,
  UpdatePackageDto
> {
  constructor() {
    super(prismaMembership.package);
  }

  override async create(data: CreatePackageDto): Promise<PackageModel> {
    try {
      const createdPackage = await prismaMembership.package.create({ data });
      return createdPackage;
    } catch (error: any) {
      if (error?.code === 'P2002') {
        const target = error.meta?.target;

        const isNameConflict =
          typeof target === 'string' && target.includes('name');

        if (isNameConflict) {
          throwGrpcError(400, SERVER_MESSAGE.BAD_REQUEST, [
            PACKAGE_MESSAGES.EXISTS(data.name ?? ''),
          ]);
        }
        throwGrpcError(409, SERVER_MESSAGE.UNIQUE_CONSTRAINT_FAILED, [
          SERVER_MESSAGE.UNIQUE_CONSTRAINT_FAILED,
        ]);
      }

      if (error?.code === 'P2003') {
        const field = error.meta?.field_name ?? 'relation';
        throwGrpcError(400, SERVER_MESSAGE.FOREIGN_KEY_FAILED, [
          SERVER_MESSAGE.FOREIGN_KEY_INVALID(field),
        ]);
      }

      throwGrpcError(500, SERVER_MESSAGE.DATABASE_ERROR, [
        error.message ?? SERVER_MESSAGE.UNEXPECTED_ERROR,
      ]);
    }
  }

  async updatePackage(
    id: string,
    data: UpdatePackageDto,
  ): Promise<PackageModel> {
    if (data.usageType === UsageType.Infinite) {
      data.maxUsages = null as any;
    } else if (data.maxUsages !== undefined) {
      if (data.maxUsages < 0) {
        throwGrpcError(400, SERVER_MESSAGE.BAD_REQUEST, [
          PACKAGE_MESSAGES.MAX_USAGES_MUST_BE_POSITIVE,
        ]);
      }
      if (!data.usageType) {
        data.usageType = UsageType.Finite;
      }
    }
    try {
      const updatedPackage = await prismaMembership.package
        .update({
          where: { id },
          data,
        })
        .then(async (res) => {
          if (res.maxUsages === null && res.usageType === UsageType.Finite) {
            return await prismaMembership.package.update({
              where: { id },
              data: {
                maxUsages: 0,
              },
            });
          }
          return res;
        });

      return updatedPackage;
    } catch (error: any) {
      if (error?.code === 'P2002') {
        const target = error.meta?.target;

        const isNameConflict =
          typeof target === 'string' && target.includes('name');

        if (isNameConflict) {
          throwGrpcError(400, SERVER_MESSAGE.BAD_REQUEST, [
            PACKAGE_MESSAGES.EXISTS(data.name ?? ''),
          ]);
        }
        throwGrpcError(409, SERVER_MESSAGE.UNIQUE_CONSTRAINT_FAILED, [
          SERVER_MESSAGE.UNIQUE_CONSTRAINT_FAILED,
        ]);
      }

      if (error?.code === 'P2003') {
        const field = error.meta?.field_name ?? 'relation';
        throwGrpcError(400, SERVER_MESSAGE.FOREIGN_KEY_FAILED, [
          SERVER_MESSAGE.FOREIGN_KEY_INVALID(field),
        ]);
      }

      throwGrpcError(500, SERVER_MESSAGE.DATABASE_ERROR, [
        error.message ?? SERVER_MESSAGE.UNEXPECTED_ERROR,
      ]);
    }
  }

  async toggleStatus(id: string): Promise<PackageModel> {
    try {
      const pkg = await this.findOne(id);
      const newStatus =
        pkg?.status === PackageStatus.Active
          ? PackageStatus.Inactive
          : PackageStatus.Active;
      const updatedPackage = await this.update(id, { status: newStatus });
      return updatedPackage;
    } catch (error: any) {
      if (error?.code === 'P2025') {
        throwGrpcError(404, SERVER_MESSAGE.NOT_FOUND, [
          PACKAGE_MESSAGES.NOT_FOUND,
        ]);
      }
      throwGrpcError(500, SERVER_MESSAGE.DATABASE_ERROR, [
        error.message ?? SERVER_MESSAGE.UNEXPECTED_ERROR,
      ]);
    }
  }

  async getByIds(ids: string[]): Promise<PackageModel[]> {
    const packages = await prismaMembership.package.findMany({
      where: {
        id: { in: ids },
      },
    });
    return packages;
  }
}
