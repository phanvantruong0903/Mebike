import { Module } from '@nestjs/common';
import { StockService } from './stock.service';
import { StockResolver } from './stock.resolver';
import { ClientsModule, Transport } from '@nestjs/microservices';
import {
  ConsuleModule,
  ConsulService,
  CONSULT_SERVICE_ID,
  GRPC_PACKAGE,
} from '@loginex/common';
import { join } from 'node:path';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConsuleModule,
    ConfigModule.forRoot({ isGlobal: true }),
    ClientsModule.registerAsync([
      {
        name: GRPC_PACKAGE.INVENTORY,
        imports: [ConsuleModule],
        inject: [ConsulService],
        useFactory: async (consulService: ConsulService) => {
          const stockService = await consulService.discoverService(
            CONSULT_SERVICE_ID.INVENTORY,
          );
          return {
            transport: Transport.GRPC,
            options: {
              package: 'inventory',
              protoPath: [
                join(
                  process.cwd(),
                  'common/src/lib/proto/inventory-shared.proto',
                ),
                join(process.cwd(), 'common/src/lib/proto/stock.proto'),
              ],
              url: `${stockService.address}:${stockService.port}`,
            },
          };
        },
      },
    ]),
  ],
  providers: [StockResolver, StockService],
})
export class StockModule {}
