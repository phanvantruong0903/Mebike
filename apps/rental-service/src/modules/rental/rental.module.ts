import { Module } from '@nestjs/common';
import { RentalController } from './rental.controller';
import { RentalService } from './rental.service';
import { ConfigModule } from '@nestjs/config';
import { ConsulModule } from '@mebike/common';

@Module({
  imports: [ConsulModule, ConfigModule.forRoot({ isGlobal: true })],
  controllers: [RentalController],
  providers: [RentalService],
})
export class RentalModule {}
