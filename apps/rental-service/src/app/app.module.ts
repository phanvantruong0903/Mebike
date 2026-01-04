import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RentalModule } from '../modules/rental/rental.module';
import { HealthController } from '../health/health.controller';
import { ReservationModule } from '../modules/reservation/reservation.module';

@Module({
  imports: [RentalModule, ReservationModule],
  controllers: [AppController, HealthController],
  providers: [AppService],
})
export class AppModule {}
