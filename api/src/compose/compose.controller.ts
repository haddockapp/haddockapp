import { Body, Controller, Get } from '@nestjs/common';
import { ComposeService } from './compose.service';

@Controller('compose')
export class ComposeController {
  constructor(private composeService: ComposeService) {}

  @Get()
  parse(@Body() data: { compose: string }) {
    return this.composeService.parseServices(data.compose);
  }
}
