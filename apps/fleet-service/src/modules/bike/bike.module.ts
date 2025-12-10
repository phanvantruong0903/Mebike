import { Module } from '@nestjs/common';
import { ConsuleModule } from '@mebike/common';
import { ConfigModule } from '@nestjs/config';
import { BikeController } from './bike.controller';
import { BikeService } from './bike.service';

@Module({
  imports: [ConsuleModule, ConfigModule.forRoot({ isGlobal: true })],
  controllers: [BikeController],
  providers: [BikeService],
})
export class BikeModule {}
