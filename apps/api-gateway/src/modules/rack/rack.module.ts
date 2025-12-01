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
import { RackService } from './rack.service';
import { RackResolver } from './rack.resolver';

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
          const rackService = await consulService.discoverService(
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
                join(process.cwd(), 'common/src/lib/proto/rack.proto'),
              ],
              url: `${rackService.address}:${rackService.port}`,
            },
          };
        },
      },
    ]),
  ],
  providers: [RackService, RackResolver],
})
export class RackModule {}
