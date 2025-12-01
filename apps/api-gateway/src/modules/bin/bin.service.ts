import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { Observable, firstValueFrom, lastValueFrom } from 'rxjs';
import {
  GRPC_PACKAGE,
  GRPC_SERVICES,
  BinResponse,
  BinListResponse,
  UpdateBinInput,
  CreateBinInput,
} from '@loginex/common';

interface BinServiceClient {
  ListBins(data: {
    page: number;
    limit: number;
    search?: string;
  }): Observable<BinListResponse>;
  UpdateBin(data: { id: string } & UpdateBinInput): Observable<BinResponse>;
  CreateBin(data: CreateBinInput): Observable<BinResponse>;
  DeleteBin(data: { id: string }): Observable<BinResponse>;
}

@Injectable()
export class BinService implements OnModuleInit {
  private binService!: BinServiceClient;

  constructor(
    @Inject(GRPC_PACKAGE.INVENTORY) private readonly client: ClientGrpc,
  ) {}

  onModuleInit() {
    this.binService = this.client.getService<BinServiceClient>(
      GRPC_SERVICES.BIN,
    );
  }

  async getAllBin(data: { page: number; limit: number }) {
    return await lastValueFrom(this.binService.ListBins(data));
  }

  async updateBin(id: string, data: UpdateBinInput) {
    return await firstValueFrom(this.binService.UpdateBin({ id, ...data }));
  }

  async createBin(data: CreateBinInput) {
    return await firstValueFrom(this.binService.CreateBin(data));
  }

  async deleteBin(data: { id: string }) {
    return await firstValueFrom(this.binService.DeleteBin(data));
  }
}
