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
import { SosService } from './sos.service';
import { SosResolver } from './sos.resolver';

@Module({
  imports: [
    ConsulModule,
    RedisModule,
    ConfigModule.forRoot({ isGlobal: true }),
    ClientsModule.registerAsync([
      {
        name: GRPC_PACKAGE.SOS,
        imports: [ConsulModule],
        inject: [ConsulService],
        useFactory: async (consulService: ConsulService) => {
          const incidentService = await consulService.discoverService(
            CONSULT_SERVICE_ID.INCIDENT,
          );
          return {
            transport: Transport.GRPC,
            options: {
              package: 'sos',
              protoPath: join(process.cwd(), 'common/src/lib/proto/sos.proto'),
              url: `${incidentService.address}:${incidentService.port}`,
            },
          };
        },
      },
    ]),
  ],
  providers: [SosService, SosResolver],
})
export class SosModule {}
