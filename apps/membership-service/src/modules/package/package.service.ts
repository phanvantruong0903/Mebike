import {
  BaseService,
  CreatePackageDto,
  PackageModel,
  prismaMembership,
  UpdatePackageDto,
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
}
