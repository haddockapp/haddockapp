import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ConfigurationRepository } from './configuration.repository';
import { ConfigurationService } from './configuration.service';
import { ConfigurationController } from './configuration.controller';

@Module({
  imports: [PrismaModule],
  controllers: [ConfigurationController],
  providers: [ConfigurationRepository, ConfigurationService],
  exports: [ConfigurationRepository, ConfigurationService],
})
export class ConfigurationModule {}
