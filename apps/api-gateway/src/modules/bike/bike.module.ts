import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'node:path';
import {
  ConsuleModule,
  ConsulService,
  CONSULT_SERVICE_ID,
  GRPC_PACKAGE,
  RedisModule,
} from '@mebike/common';
import { ConfigModule } from '@nestjs/config';
import { BikeService } from './bike.service';
import { BikeResolver } from './bike.resolver';

@Module({
  imports: [
    ConsuleModule,
    RedisModule,
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
              package: 'bike',
              protoPath: join(process.cwd(), 'common/src/lib/proto/bike.proto'),
              url: `${fleetService.address}:${fleetService.port}`,
            },
          };
        },
      },
    ]),
  ],
  providers: [BikeService, BikeResolver],
})
export class BikeModule {}
