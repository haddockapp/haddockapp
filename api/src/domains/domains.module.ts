import { Module } from '@nestjs/common';
import { CaddyModule } from '../caddy/caddy.module';
import { FrontendModule } from '../frontend/frontend.module';
import { PrismaModule } from '../prisma/prisma.module';
import { BindingService } from './dns/binding.service';
import { DnsService } from './dns/dns.service';
import { DomainsController } from './domains.controller';
import { DomainRepository } from './domains.repository';
import { DomainsService } from './domains.service';
import { ConfigurationModule } from 'src/configuration/configuration.module';
import { AutologinsModule } from '../autologins/autologins.module';

@Module({
  imports: [PrismaModule, FrontendModule, CaddyModule, ConfigurationModule, AutologinsModule],
  controllers: [DomainsController],
  providers: [
    DomainsService,
    BindingService,
    DnsService,
    DomainRepository
  ],
  exports: [
    DomainRepository
  ],
})
export class DomainsModule {}
