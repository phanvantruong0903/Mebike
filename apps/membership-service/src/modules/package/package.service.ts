import {
  BaseService,
  CreatePackageDto,
  PACKAGE_MESSAGES,
  PackageModel,
  prismaMembership,
  SERVER_MESSAGE,
  throwGrpcError,
  UpdatePackageDto,
} from '@mebike/common';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class PackageService extends BaseService<
  PackageModel,
  CreatePackageDto,
  UpdatePackageDto
> {
  private readonly logger = new Logger(PackageService.name);
  constructor() {
    super(prismaMembership.package);
  }

  override async create(data: CreatePackageDto): Promise<PackageModel> {
    this.logger.debug('Creating package');
    const existingPackage = await prismaMembership.package.findUnique({
      where: {
        name: data.name,
      },
    });
    this.logger.debug('Existing package: ', existingPackage);

    if (existingPackage) {
      throwGrpcError(400, SERVER_MESSAGE.BAD_REQUEST, [
        PACKAGE_MESSAGES.EXISTS,
      ]);
    }
    this.logger.debug('Creating package');
    const result = await prismaMembership.package.create({ data });
    this.logger.debug('Created package: ', result);
    return result;
  }
}
