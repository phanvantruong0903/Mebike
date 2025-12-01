import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { Observable, firstValueFrom, lastValueFrom } from 'rxjs';
import {
  GRPC_PACKAGE,
  GRPC_SERVICES,
  ZoneListResponse,
  UpdateZoneInput,
  CreateZoneInput,
  ZoneResponse,
} from '@loginex/common';

interface ZoneServiceClient {
  ListZones(data: {
    page: number;
    limit: number;
    search?: string;
  }): Observable<ZoneListResponse>;
  UpdateZone(data: { id: string } & UpdateZoneInput): Observable<ZoneResponse>;
  CreateZone(data: CreateZoneInput): Observable<ZoneResponse>;
  DeleteZone(data: { id: string }): Observable<ZoneResponse>;
}

@Injectable()
export class ZoneService implements OnModuleInit {
  private zoneService!: ZoneServiceClient;

  constructor(
    @Inject(GRPC_PACKAGE.INVENTORY) private readonly client: ClientGrpc,
  ) {}

  onModuleInit() {
    this.zoneService = this.client.getService<ZoneServiceClient>(
      GRPC_SERVICES.ZONE,
    );
  }

  async getAllZone(data: { page: number; limit: number }) {
    return await lastValueFrom(this.zoneService.ListZones(data));
  }

  async updateZone(id: string, data: UpdateZoneInput) {
    return await firstValueFrom(this.zoneService.UpdateZone({ id, ...data }));
  }

  async createZone(data: CreateZoneInput) {
    return await firstValueFrom(this.zoneService.CreateZone(data));
  }

  async deleteZone(data: { id: string }) {
    return await firstValueFrom(this.zoneService.DeleteZone(data));
  }
}
