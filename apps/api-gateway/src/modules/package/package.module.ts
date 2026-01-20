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
import { PackageService } from './package.service';
import { PackageResolver } from './package.resolver';
import { PackageDataloader } from './package.dataloader';

@Module({
  imports: [
    RedisModule,
    ConfigModule.forRoot({ isGlobal: true }),
    ClientsModule.registerAsync([
      {
        name: GRPC_PACKAGE.MEMBERSHIP,
        imports: [ConsulModule],
        inject: [ConsulService],
        useFactory: async (consulService: ConsulService) => {
          const membershipService = await consulService.discoverService(
            CONSULT_SERVICE_ID.MEMBERSHIP,
          );
          return {
            transport: Transport.GRPC,
            options: {
              package: 'package',
              protoPath: join(
                process.cwd(),
                'common/src/lib/proto/package.proto',
              ),
              url: `${membershipService.address}:${membershipService.port}`,
            },
          };
        },
      },
    ]),
  ],
  providers: [PackageService, PackageResolver, PackageDataloader],
  exports: [PackageService, PackageDataloader],
})
export class PackageModule {}
