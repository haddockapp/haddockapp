import { Controller, Get } from '@nestjs/common';
import { TemplatesService } from './templates.service';
import { TemplateResponse } from './types/template.response';

@Controller('templates')
export class TemplatesController {
  constructor(private readonly templatesService: TemplatesService) {}

  @Get()
  async listProjects(): Promise<TemplateResponse[]> {
    return this.templatesService.listTemplates();
  }
}
