import { forwardRef, Module } from '@nestjs/common';
import { ReservationController } from './reservation.controller';
import { ConfigModule } from '@nestjs/config';
import {
  ConsulModule,
  CONSULT_SERVICE_ID,
  createGrpcClient,
  GRPC_PACKAGE,
} from '@mebike/common';
import { ReservationService } from './reservation.service';
import { ClientsModule } from '@nestjs/microservices';
import { SagaModule } from '../../saga/saga.module';

@Module({
  imports: [
    ConsulModule,
    ConfigModule.forRoot({ isGlobal: true }),
    forwardRef(() => SagaModule),
    ClientsModule.registerAsync([
      createGrpcClient(
        GRPC_PACKAGE.BIKE,
        CONSULT_SERVICE_ID.FLEET,
        'bike',
        'bike.proto',
      ),
    ]),
  ],
  controllers: [ReservationController],
  providers: [ReservationService],
  exports: [ReservationService],
})
export class ReservationModule {}
