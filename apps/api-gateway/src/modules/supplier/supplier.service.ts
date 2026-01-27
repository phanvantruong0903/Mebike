import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { Observable, firstValueFrom } from 'rxjs';
import {
  GRPC_PACKAGE,
  GRPC_SERVICES,
  SupplierResponse,
  SupplierListResponse,
  SupplierStatsResponse,
  UpdateSupplierDto,
  CreateSupplierInput,
  GetSupplierInput,
  Supplier,
  SupplierSearchResult,
  meiliClient,
  SupplierSearchPage,
  ChangeSupplierStatusDto,
} from '@mebike/common';

interface SupplierServiceClient {
  GetSupplier(data: { id: string }): Observable<SupplierResponse>;
  UpdateSupplier(data: UpdateSupplierDto): Observable<SupplierResponse>;
  GetAllSuppliers(data: GetSupplierInput): Observable<SupplierListResponse>;
  ChangeSupplierStatus(
    data: ChangeSupplierStatusDto,
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

  async onModuleInit() {
    this.fleetService = this.client.getService<SupplierServiceClient>(
      GRPC_SERVICES.FLEET,
    );
  }

  async createSupplier(data: CreateSupplierInput) {
    return await firstValueFrom(this.fleetService.CreateSupplier(data));
  }

  async updateSupplier(data: UpdateSupplierDto) {
    return await firstValueFrom(this.fleetService.UpdateSupplier(data));
  }

  async getAllSuppliers(data: GetSupplierInput) {
    const response = await firstValueFrom(
      this.fleetService.GetAllSuppliers(data),
    );
    const suppliers = response.data as Supplier[];
    return {
      ...response,
      data: suppliers
        ? suppliers.map((supplier) => ({
            ...supplier,
            bikes: supplier.bikes ?? [],
          }))
        : [],
    };
  }

  async changeSupplierStatus(data: ChangeSupplierStatusDto) {
    return await firstValueFrom(this.fleetService.ChangeSupplierStatus(data));
  }

  async getSupplier(data: { id: string }) {
    const response = await firstValueFrom(this.fleetService.GetSupplier(data));
    const supplier = response.data as Supplier;
    return {
      ...response,
      data: supplier
        ? {
            ...supplier,
            bikes: supplier.bikes ?? [],
          }
        : supplier,
    };
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

  async autoComplete(query: string): Promise<SupplierSearchResult> {
    const result = await meiliClient.index('Supplier').search(query, {
      limit: 10,
    });
    const suppliers = (result.hits as Supplier[]) ?? [];
    return {
      data: suppliers.map((supplier) => ({
        ...supplier,
        bikes: [],
      })),
    };
  }

  async searchSupplier(
    page: number,
    limit: number,
    search: string,
  ): Promise<SupplierSearchPage> {
    const result = await meiliClient.index('Supplier').search(search, {
      limit,
      offset: (page - 1) * limit,
    });
    const suppliers = (result.hits as Supplier[]) ?? [];
    return {
      data: suppliers.map((supplier) => ({
        ...supplier,
        bikes: [],
      })),
      pagination: {
        total: result.estimatedTotalHits || 0,
        page,
        limit,
        totalPages: Math.ceil(result.estimatedTotalHits / limit),
      },
    };
  }
}
