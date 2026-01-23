import {
  GRPC_PACKAGE,
  ConsulModule,
  CONSULT_SERVICE_ID,
  JwtSharedModule,
  RedisModule,
  createGrpcClient,
} from '@mebike/common';
import { forwardRef, Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { RentalActivities } from './activities';
import { TemporalService } from './temporal-service';
import { ConfigModule } from '@nestjs/config';
import { RentalModule } from '../modules/rental/rental.module';

@Module({
  imports: [
    ConsulModule,
    RedisModule,
    JwtSharedModule,
    forwardRef(() => RentalModule),
    ConfigModule.forRoot({ isGlobal: true }),
    ClientsModule.registerAsync([
      createGrpcClient(
        GRPC_PACKAGE.BIKE,
        CONSULT_SERVICE_ID.FLEET,
        'bike',
        'bike.proto',
      ),
      createGrpcClient(
        GRPC_PACKAGE.STATION,
        CONSULT_SERVICE_ID.FLEET,
        'station',
        'station.proto',
      ),
      createGrpcClient(
        GRPC_PACKAGE.WALLET,
        CONSULT_SERVICE_ID.PAYMENT,
        'wallet',
        'wallet.proto',
      ),
      createGrpcClient(
        GRPC_PACKAGE.PAYMENT,
        CONSULT_SERVICE_ID.PAYMENT,
        'payment',
        'payment.proto',
      ),
    ]),
  ],
  providers: [RentalActivities, TemporalService],
  exports: [TemporalService],
})
export class SagaModule {}
