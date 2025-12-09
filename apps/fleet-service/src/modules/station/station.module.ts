import { Module } from '@nestjs/common';
import {
  ConsuleModule,
  ConsulService,
  CONSULT_SERVICE_ID,
  GRPC_PACKAGE,
  JwtSharedModule,
  RedisModule,
} from '@mebike/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule } from '@nestjs/config';
import { join } from 'node:path';
import { StationService } from './station.service';
import { StationController } from './station.controller';

@Module({
  imports: [
    ConsuleModule,
    RedisModule,
    JwtSharedModule,
    ConfigModule.forRoot({ isGlobal: true }),
    ClientsModule.registerAsync([
      {
        name: GRPC_PACKAGE.FLEET,
        imports: [ConsuleModule],
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
  controllers: [StationController],
  providers: [StationService],
})
export class StationModule {}
