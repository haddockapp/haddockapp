import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { DomainsService } from './domains.service';
import { CreateDomainDto } from './dto/create-domain.dto';
import { CurrentUser } from '../auth/user.context';
import { User } from '@prisma/client';

@Controller('domains')
export class DomainsController {
  constructor(private readonly domainsService: DomainsService) {}

  @Post()
  create(@Body() createDomainDto: CreateDomainDto) {
    return this.domainsService.create(createDomainDto);
  }

  @Post('apply')
  apply(@CurrentUser() user: User) {
    return this.domainsService.apply(user.id);
  }

  @Get()
  findAll() {
    return this.domainsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.domainsService.findOne(id);
  }

  @Get(':id/status')
  getDomainStatus(@Param('id') id: string) {
    return this.domainsService.getDomainStatus(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.domainsService.remove(id);
  }
}
