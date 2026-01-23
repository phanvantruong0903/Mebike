import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { Observable, firstValueFrom } from 'rxjs';
import {
  GRPC_PACKAGE,
  GRPC_SERVICES,
  CreatePackageInput,
  PackageResponse,
  GetPackageListInput,
  PackageListResponse,
  UpdatePackageInput,
  Package,
} from '@mebike/common';

interface PackageServiceClient {
  CreatePackage(data: CreatePackageInput): Observable<PackageResponse>;
  UpdatePackage(
    data: UpdatePackageInput & { id: string },
  ): Observable<PackageResponse>;
  GetPackage(data: { id: string }): Observable<PackageResponse>;
  GetPackageList(data: GetPackageListInput): Observable<PackageListResponse>;
  TogglePackageStatus(data: { id: string }): Observable<PackageResponse>;
  GetPackagesByIds(data: { ids: string[] }): Observable<{ data: Package[] }>;
}

@Injectable()
export class PackageService implements OnModuleInit {
  private packageService!: PackageServiceClient;

  constructor(
    @Inject(GRPC_PACKAGE.PACKAGE) private readonly client: ClientGrpc,
  ) {}

  onModuleInit() {
    this.packageService = this.client.getService<PackageServiceClient>(
      GRPC_SERVICES.MEMBERSHIP,
    );
  }

  async createPackage(data: CreatePackageInput) {
    return await firstValueFrom(this.packageService.CreatePackage(data));
  }

  async updatePackage(data: UpdatePackageInput & { id: string }) {
    return await firstValueFrom(this.packageService.UpdatePackage(data));
  }

  async getPackageList(data: GetPackageListInput) {
    const response = await firstValueFrom(
      this.packageService.GetPackageList(data),
    );
    return {
      ...response,
      data: response.data ?? [],
    };
  }

  async getPackage(id: string) {
    return await firstValueFrom(this.packageService.GetPackage({ id }));
  }

  async togglePackageStatus(id: string) {
    return await firstValueFrom(
      this.packageService.TogglePackageStatus({ id }),
    );
  }

  async getPackagesByIds(ids: string[]): Promise<Package[]> {
    const response = await firstValueFrom(
      this.packageService.GetPackagesByIds({ ids }),
    );
    return response.data || [];
  }
}
