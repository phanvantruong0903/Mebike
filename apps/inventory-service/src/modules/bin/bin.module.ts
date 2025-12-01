import { Module } from '@nestjs/common';
import { BinController } from './bin.controller';
import { BinService } from './bin.service';

@Module({
  controllers: [BinController],
  providers: [BinService],
  exports: [BinService],
})
export class BinModule {}
