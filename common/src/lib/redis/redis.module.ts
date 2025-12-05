import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { REDIS_CONSTANTS } from '../constants/redis';
import { Redis } from 'ioredis';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: REDIS_CONSTANTS.REDIS_CLIENT,
      useFactory: async (configService: ConfigService) => {
        return new Redis({
          host:
            configService.get<string>(REDIS_CONSTANTS.REDIS_HOST) ||
            'localhost',
          port: configService.get<number>(REDIS_CONSTANTS.REDIS_PORT) || 6379,
          password:
            configService.get<string>(REDIS_CONSTANTS.REDIS_PASSWORD) ||
            'mebikeredis0903',
        });
      },
      inject: [ConfigService],
    },
  ],
  exports: [REDIS_CONSTANTS.REDIS_CLIENT],
})
export class RedisModule {}
