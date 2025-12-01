import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import {
  GRPC_SERVICES,
  GetStockInput,
  UpdateStockInput,
  StockLevelResponse,
  GRPC_PACKAGE,
} from '@loginex/common';
import { Observable, lastValueFrom } from 'rxjs';

interface StockServiceClient {
  GetStockLevel(data: GetStockInput): Observable<StockLevelResponse>;
  AdjustStock(data: UpdateStockInput): Observable<StockLevelResponse>;
}

@Injectable()
export class StockService implements OnModuleInit {
  private stockService!: StockServiceClient;

  constructor(
    @Inject(GRPC_PACKAGE.INVENTORY) private readonly client: ClientGrpc,
  ) {}

  onModuleInit() {
    this.stockService = this.client.getService<StockServiceClient>(
      GRPC_SERVICES.STOCK,
    );
  }

  async getStockLevel(data: GetStockInput): Promise<StockLevelResponse> {
    return await lastValueFrom(this.stockService.GetStockLevel(data));
  }

  async adjustStock(data: UpdateStockInput): Promise<StockLevelResponse> {
    return await lastValueFrom(this.stockService.AdjustStock(data));
  }
}
