import { Module } from '@nestjs/common';
import { PackageController } from './package.controller';
import { ConfigModule } from '@nestjs/config';
import { ConsulModule } from '@mebike/common';
import { PackageService } from './package.service';

@Module({
  imports: [ConsulModule, ConfigModule.forRoot({ isGlobal: true })],
  controllers: [PackageController],
  providers: [PackageService],
})
export class PackageModule {}
