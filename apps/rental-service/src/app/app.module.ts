import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RentalModule } from '../modules/rental/rental.module';
import { HealthController } from '../health/health.controller';

@Module({
  imports: [RentalModule],
  controllers: [AppController, HealthController],
  providers: [AppService],
})
export class AppModule {}
