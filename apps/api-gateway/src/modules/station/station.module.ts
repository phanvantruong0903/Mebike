import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'node:path';
import {
  ConsulModule,
  ConsulService,
  CONSULT_SERVICE_ID,
  GRPC_PACKAGE,
  RedisModule,
} from '@mebike/common';
import { ConfigModule } from '@nestjs/config';
import { StationService } from './station.service';
import { StationResolver } from './station.resolver';

@Module({
  imports: [
    ConsulModule,
    RedisModule,
    ConfigModule.forRoot({ isGlobal: true }),
    ClientsModule.registerAsync([
      {
        name: GRPC_PACKAGE.FLEET,
        imports: [ConsulModule],
        inject: [ConsulService],
        useFactory: async (consulService: ConsulService) => {
          const fleetService = await consulService.discoverService(
            CONSULT_SERVICE_ID.FLEET,
          );
          return {
            transport: Transport.GRPC,
            options: {
              package: 'station',
              protoPath: join(
                process.cwd(),
                'common/src/lib/proto/station.proto',
              ),
              url: `${fleetService.address}:${fleetService.port}`,
            },
          };
        },
      },
    ]),
  ],
  providers: [StationService, StationResolver],
  exports: [StationService],
})
export class StationModule {}
