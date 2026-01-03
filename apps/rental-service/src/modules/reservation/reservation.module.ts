import { Module } from '@nestjs/common';
import { ReservationController } from './reservation.controller';
import { ConfigModule } from '@nestjs/config';
import { ConsulModule } from '@mebike/common';
import { ReservationService } from './reservation.service';

@Module({
  imports: [ConsulModule, ConfigModule.forRoot({ isGlobal: true })],
  controllers: [ReservationController],
  providers: [ReservationService],
})
export class ReservationModule {}
