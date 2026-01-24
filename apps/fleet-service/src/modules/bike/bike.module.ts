import { Module } from '@nestjs/common';
import { ConsulModule, RedisModule } from '@mebike/common';
import { ConfigModule } from '@nestjs/config';
import { BikeController } from './bike.controller';
import { BikeService } from './bike.service';

@Module({
  imports: [
    RedisModule,
    ConsulModule,
    ConfigModule.forRoot({ isGlobal: true }),
  ],
  controllers: [BikeController],
  providers: [BikeService],
})
export class BikeModule {}
