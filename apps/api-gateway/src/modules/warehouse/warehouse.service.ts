import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { Observable, firstValueFrom, lastValueFrom } from 'rxjs';
import {
  GRPC_PACKAGE,
  GRPC_SERVICES,
  WarehouseResponse,
  WarehouseListResponse,
  UpdateWareHouseInput,
  CreateWareHouseInput,
} from '@loginex/common';

interface WarehouseServiceClient {
  ListWarehouses(data: {
    page: number;
    limit: number;
    search?: string;
  }): Observable<WarehouseListResponse>;
  GetWarehouse(data: { id: string }): Observable<WarehouseResponse>;
  UpdateWarehouse(
    data: { id: string } & UpdateWareHouseInput,
  ): Observable<WarehouseResponse>;
  CreateWarehouse(data: CreateWareHouseInput): Observable<WarehouseResponse>;
  DeleteWarehouse(data: { id: string }): Observable<WarehouseResponse>;
  InactivateWarehouse(data: { id: string }): Observable<WarehouseResponse>;
  ActivateWarehouse(data: { id: string }): Observable<WarehouseResponse>;
}

@Injectable()
export class WarehouseService implements OnModuleInit {
  private warehouseService!: WarehouseServiceClient;

  constructor(
    @Inject(GRPC_PACKAGE.INVENTORY) private readonly client: ClientGrpc,
  ) {}

  onModuleInit() {
    this.warehouseService = this.client.getService<WarehouseServiceClient>(
      GRPC_SERVICES.WAREHOUSE,
    );
  }

  async getAllWarehouse(data: { page: number; limit: number }) {
    return await lastValueFrom(this.warehouseService.ListWarehouses(data));
  }

  async getWarehouse(id: string) {
    return await firstValueFrom(this.warehouseService.GetWarehouse({ id }));
  }

  async updateWarehouse(id: string, data: UpdateWareHouseInput) {
    return await firstValueFrom(
      this.warehouseService.UpdateWarehouse({ id, ...data }),
    );
  }

  async createWarehouse(data: CreateWareHouseInput) {
    return await firstValueFrom(this.warehouseService.CreateWarehouse(data));
  }

  async deleteWarehouse(data: { id: string }) {
    return await firstValueFrom(this.warehouseService.DeleteWarehouse(data));
  }

  async inactivateWarehouse(data: { id: string }) {
    return await firstValueFrom(
      this.warehouseService.InactivateWarehouse(data),
    );
  }

  async activateWarehouse(data: { id: string }) {
    return await firstValueFrom(this.warehouseService.ActivateWarehouse(data));
  }
}
