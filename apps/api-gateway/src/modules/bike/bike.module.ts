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
import { BikeService } from './bike.service';
import { BikeResolver, BikeResultResolver } from './bike.resolver';
import { SupplierModule } from '../supplier/supplier.module';
import { StationModule } from '../station/station.module';
import { StationDataloader } from './station.dataloader';
import { SupplierDataloader } from './supplier.dataloader';
import { BikeController } from './bike.controller';

@Module({
  imports: [
    ConsulModule,
    RedisModule,
    StationModule,
    SupplierModule,
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
              package: 'bike',
              protoPath: join(process.cwd(), 'common/src/lib/proto/bike.proto'),
              url: `${fleetService.address}:${fleetService.port}`,
            },
          };
        },
      },
    ]),
  ],
  controllers: [BikeController],
  providers: [
    BikeService,
    BikeResolver,
    StationDataloader,
    SupplierDataloader,
    BikeResultResolver,
  ],
  exports: [BikeService, StationDataloader],
})
export class BikeModule {}
