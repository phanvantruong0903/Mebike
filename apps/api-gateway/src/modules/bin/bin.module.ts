import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'node:path';
import {
  ConsuleModule,
  ConsulService,
  CONSULT_SERVICE_ID,
  GRPC_PACKAGE,
} from '@loginex/common';
import { ConfigModule } from '@nestjs/config';
import { BinService } from './bin.service';
import { BinResolver } from './bin.resolver';

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
          const binService = await consulService.discoverService(
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
                join(process.cwd(), 'common/src/lib/proto/bin.proto'),
              ],
              url: `${binService.address}:${binService.port}`,
            },
          };
        },
      },
    ]),
  ],
  providers: [BinService, BinResolver],
})
export class BinModule {}
