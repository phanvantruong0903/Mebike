import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { Observable, firstValueFrom, lastValueFrom } from 'rxjs';
import {
  GRPC_PACKAGE,
  GRPC_SERVICES,
  RackListResponse,
  UpdateRackInput,
  RackResponse,
  CreateRackInput,
} from '@loginex/common';

interface RackServiceClient {
  ListRacks(data: {
    page: number;
    limit: number;
    search?: string;
  }): Observable<RackListResponse>;
  UpdateRack(data: { id: string } & UpdateRackInput): Observable<RackResponse>;
  CreateRack(data: CreateRackInput): Observable<RackResponse>;
  DeleteRack(data: { id: string }): Observable<RackResponse>;
}

@Injectable()
export class RackService implements OnModuleInit {
  private rackService!: RackServiceClient;

  constructor(
    @Inject(GRPC_PACKAGE.INVENTORY) private readonly client: ClientGrpc,
  ) {}

  onModuleInit() {
    this.rackService = this.client.getService<RackServiceClient>(
      GRPC_SERVICES.RACK,
    );
  }

  async getAllRack(data: { page: number; limit: number }) {
    return await lastValueFrom(this.rackService.ListRacks(data));
  }

  async updateRack(id: string, data: UpdateRackInput) {
    return await firstValueFrom(this.rackService.UpdateRack({ id, ...data }));
  }

  async createRack(data: CreateRackInput) {
    return await firstValueFrom(this.rackService.CreateRack(data));
  }

  async deleteRack(data: { id: string }) {
    return await firstValueFrom(this.rackService.DeleteRack(data));
  }
}
