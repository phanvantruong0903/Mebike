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
import { RentalService } from './rental.service';
import { RentalResolver } from './rental.resolver';
import { StationModule } from '../station/station.module';
import { BikeDataloader } from './bike.dataloader';
import { BikeModule } from '../bike/bike.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    RedisModule,
    UserModule,
    StationModule,
    BikeModule,
    ConfigModule.forRoot({ isGlobal: true }),
    ClientsModule.registerAsync([
      {
        name: GRPC_PACKAGE.RENTAL,
        imports: [ConsulModule],
        inject: [ConsulService],
        useFactory: async (consulService: ConsulService) => {
          const rentalService = await consulService.discoverService(
            CONSULT_SERVICE_ID.RENTAL,
          );
          return {
            transport: Transport.GRPC,
            options: {
              package: 'rental',
              protoPath: join(
                process.cwd(),
                'common/src/lib/proto/rental.proto',
              ),
              url: `${rentalService.address}:${rentalService.port}`,
            },
          };
        },
      },
    ]),
  ],
  providers: [RentalService, RentalResolver, BikeDataloader],
  exports: [BikeDataloader],
})
export class RentalModule {}
