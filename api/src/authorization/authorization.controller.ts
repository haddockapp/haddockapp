import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post
} from '@nestjs/common';
import { AuthorizationEntityService } from './authorization-entity.service';
import { CreateAuthorizationDTO } from './dto/request/create-authorization.dto';

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
  async findById(
    @Param('id') id: string
  ) {
    return await this.service.findById(id);
  }

  @Delete(':id')
  async delete(
    @Param('id') id: string
  ) {
    return await this.service.delete(id);
  }

  @Post()
  async create(
    @Body() body: CreateAuthorizationDTO
  ) {
    return body;
  }
}
