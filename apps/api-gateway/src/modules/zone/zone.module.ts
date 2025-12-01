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
import { ZoneService } from './zone.service';
import { ZoneResolver } from './zone.resolver';

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
          const zoneService = await consulService.discoverService(
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
                join(process.cwd(), 'common/src/lib/proto/zone.proto'),
              ],
              url: `${zoneService.address}:${zoneService.port}`,
            },
          };
        },
      },
    ]),
  ],
  providers: [ZoneService, ZoneResolver],
})
export class ZoneModule {}
