import { Module } from '@nestjs/common';
import { ConsulModule } from '@mebike/common';
import { ConfigModule } from '@nestjs/config';
import { BikeController } from './bike.controller';
import { BikeService } from './bike.service';

@Module({
  imports: [ConsulModule, ConfigModule.forRoot({ isGlobal: true })],
  controllers: [BikeController],
  providers: [BikeService],
})
export class BikeModule {}
