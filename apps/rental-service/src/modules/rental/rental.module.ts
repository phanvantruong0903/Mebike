import { forwardRef, Module } from '@nestjs/common';
import { RentalController } from './rental.controller';
import { RentalService } from './rental.service';
import { ConfigModule } from '@nestjs/config';
import { SagaModule } from '../../saga/saga.module';

@Module({
  imports: [
    forwardRef(() => SagaModule),
    ConfigModule.forRoot({ isGlobal: true }),
  ],
  controllers: [RentalController],
  providers: [RentalService],
})
export class RentalModule {}
