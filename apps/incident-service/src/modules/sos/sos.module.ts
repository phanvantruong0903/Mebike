import { Module } from '@nestjs/common';
import {
  ConsulModule,
  ConsulService,
  CONSULT_SERVICE_ID,
  GRPC_PACKAGE,
  JwtSharedModule,
  RedisModule,
} from '@mebike/common';
import { ConfigModule } from '@nestjs/config';
import { SosController } from './sos.controller';
import { SosService } from './sos.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'node:path';

@Module({
  imports: [
    ConsulModule,
    RedisModule,
    JwtSharedModule,
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
      {
        name: GRPC_PACKAGE.USER,
        imports: [ConsulModule],
        inject: [ConsulService],
        useFactory: async (consulService: ConsulService) => {
          const userService = await consulService.discoverService(
            CONSULT_SERVICE_ID.USER,
          );
          return {
            transport: Transport.GRPC,
            options: {
              package: 'user',
              protoPath: join(process.cwd(), 'common/src/lib/proto/user.proto'),
              url: `${userService.address}:${userService.port}`,
            },
          };
        },
      },
    ]),
  ],
  controllers: [SosController],
  providers: [SosService],
})
export class SosModule {}
