import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RentalModule } from '../modules/rental/rental.module';

@Module({
  imports: [RentalModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
