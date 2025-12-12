import { Module } from '@nestjs/common';
import { RentalController } from './rental.controller';
import { RentalService } from './rental.service';
import { ConsuleModule } from '@mebike/common';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConsuleModule, ConfigModule.forRoot({ isGlobal: true })],
  controllers: [RentalController],
  providers: [RentalService],
})
export class RentalModule {}
