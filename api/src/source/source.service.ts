import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateSourceDto } from './dto/create-source.dto';
import { SourceFactory } from './source.factory';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { SourceRepository } from './source.repository';

@Injectable()
export class SourceService {
  constructor(
    @InjectQueue('deploys') private readonly deployQueue: Queue,
    private readonly sourceFactory: SourceFactory,
    private readonly sourceRepository: SourceRepository,
  ) {}

  async registerSource(createSourceDto: CreateSourceDto) {
    const source = this.sourceFactory.createSource(createSourceDto);
    return this.sourceRepository.createSource(source);
  }

  async deploySource(sourceId: string) {
    const source = await this.sourceRepository.findById(sourceId);
    if (!source) {
      throw new NotFoundException('Source not found');
    }

    await this.deployQueue.add('deploy', source);
  }

  async deleteSource(sourceId: string) {
    return this.sourceRepository.delete(sourceId);
  }
}
