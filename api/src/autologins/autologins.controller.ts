import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AutologinsService } from './autologins.service';
import { AutologinRequestDto } from './dto/autologin.request';

@Controller('autologins')
export class AutologinsController {
  constructor(private readonly autologinsService: AutologinsService) {}

  @Post('use')
  auth(@Body() createAutologinDto: AutologinRequestDto) {
    return this.autologinsService.authWithToken(createAutologinDto.token);
  }
}
