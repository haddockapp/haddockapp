import {
  Controller,
  Delete,
  Get
} from '@nestjs/common';
import { AuthorizationEntityService } from './authorization-entity.service';

@Controller('authorization')
export class AuthorizationController {
  constructor(
    private readonly service: AuthorizationEntityService,
  ) {}

  @Get()
  async findAll() {
    return await this.service.findAll();
  }

  @Get(':id')
  async findById(id: string) {
    return await this.service.findById(id);
  }

  @Delete(':id')
  async delete(id: string) {
    return await this.service.delete(id);
  }
}
