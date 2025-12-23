import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { Observable, firstValueFrom } from 'rxjs';
import {
  GRPC_PACKAGE,
  GRPC_SERVICES,
  SupplierResponse,
  SupplierListResponse,
  SupplierStatsResponse,
  UpdateSupplierInput,
  ChangeSupplierStatusInput,
  CreateSupplierInput,
  GetSupplierInput,
  Supplier,
} from '@mebike/common';

interface SupplierServiceClient {
  GetSupplier(data: { id: string }): Observable<SupplierResponse>;
  UpdateSupplier(
    data: UpdateSupplierInput & { id: string },
  ): Observable<SupplierResponse>;
  GetAllSuppliers(data: GetSupplierInput): Observable<SupplierListResponse>;
  ChangeSupplierStatus(
    data: ChangeSupplierStatusInput & { id: string },
  ): Observable<SupplierResponse>;
  GetSupplierStats(
    data: Record<string, never>,
  ): Observable<SupplierStatsResponse>;
  CreateSupplier(data: CreateSupplierInput): Observable<SupplierResponse>;
  GetSupplierByIds(data: { ids: string[] }): Observable<{ data: Supplier[] }>;
}

@Injectable()
export class SupplierService implements OnModuleInit {
  private fleetService!: SupplierServiceClient;

  constructor(
    @Inject(GRPC_PACKAGE.FLEET) private readonly client: ClientGrpc,
  ) {}

  onModuleInit() {
    this.fleetService = this.client.getService<SupplierServiceClient>(
      GRPC_SERVICES.FLEET,
    );
  }

  async createSupplier(data: CreateSupplierInput) {
    return await firstValueFrom(this.fleetService.CreateSupplier(data));
  }

  async updateSupplier(data: UpdateSupplierInput & { id: string }) {
    return await firstValueFrom(this.fleetService.UpdateSupplier(data));
  }

  async getAllSuppliers(data: GetSupplierInput) {
    const response = await firstValueFrom(
      this.fleetService.GetAllSuppliers(data),
    );
    return {
      ...response,
      data: response.data ?? [],
    };
  }

  async changeSupplierStatus(data: ChangeSupplierStatusInput & { id: string }) {
    return await firstValueFrom(this.fleetService.ChangeSupplierStatus(data));
  }

  async getSupplier(data: { id: string }) {
    return await firstValueFrom(this.fleetService.GetSupplier(data));
  }

  async getSupplierStats() {
    return await firstValueFrom(this.fleetService.GetSupplierStats({}));
  }

  async getSupplierByIds(ids: string[]): Promise<Supplier[]> {
    const response = await firstValueFrom(
      this.fleetService.GetSupplierByIds({ ids }),
    );
    return response.data || [];
  }
}
