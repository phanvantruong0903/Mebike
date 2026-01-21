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
import { BikeDataloader } from './bike.dataloader';
import { StationDataloader } from './station.dataloader';
import { UserProfileDataloader } from './user-profile.dataloader';
import { RentalDataloader } from './rental.dataloader';
import { UserModule } from '../user/user.module';
import { RentalModule } from '../rental/rental.module';
import { BikeModule } from '../bike/bike.module';
import { StationModule } from '../station/station.module';

@Module({
  imports: [
    ConsulModule,
    RedisModule,
    UserModule,
    RentalModule,
    BikeModule,
    StationModule,
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
  providers: [
    SosService,
    SosResolver,
    UserProfileDataloader,
    BikeDataloader,
    StationDataloader,
    RentalDataloader,
  ],
})
export class SosModule {}
