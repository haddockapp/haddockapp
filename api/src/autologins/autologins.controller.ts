import { Controller, Post, Body } from '@nestjs/common';
import { AutologinsService } from './autologins.service';
import { AutologinRequestDto } from './dto/autologin.request';
import { Public } from 'src/auth/auth.decorator';

@Controller('autologins')
export class AutologinsController {
  constructor(private readonly autologinsService: AutologinsService) {}

  @Public()
  @Post('use')
  auth(@Body() createAutologinDto: AutologinRequestDto) {
    return this.autologinsService.authWithToken(createAutologinDto.token);
  }
}
