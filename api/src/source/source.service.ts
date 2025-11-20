import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateSourceDto, SourceType } from './dto/create-source.dto';
import { SourceFactory } from './source.factory';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { SourceRepository } from './source.repository';
import { SourceSettingsDto } from './dto/settings.dto';
import * as fs from 'node:fs';
import { CreatedSource } from './dto/source.dto';

@Injectable()
export class SourceService {
  private readonly logger = new Logger(SourceService.name);

  constructor(
    @InjectQueue('deploys') private readonly deployQueue: Queue,
    private readonly sourceFactory: SourceFactory,
    private readonly sourceRepository: SourceRepository,
  ) {}

  async registerSource(
    createSourceDto: CreateSourceDto,
  ): Promise<CreatedSource> {
    const source = await this.sourceFactory.createSource(createSourceDto);
    const createdSource = await this.sourceRepository.createSource(source);
    return { ...createdSource, environmentVars: source.environmentVars };
  }

  async deploySource(sourceId: string, startAfterDeploy: boolean = true) {
    const source = await this.sourceRepository.findById(sourceId);
    if (!source) {
      throw new NotFoundException('Source not found');
    }

    await this.deployQueue.add('deploy', { source, startAfterDeploy });
  }

  async deletePhysicalFiles(sourceId: string) {
    const source = await this.sourceRepository.findById(sourceId);
    if (!source) {
      throw new NotFoundException('Source not found');
    }

    switch (source.type) {
      case SourceType.GITHUB:
        // Add any specific cleanup logic for GitHub sources if needed
        break;
      case SourceType.ZIP_UPLOAD: {
        const uploadPath = `../uploads/${source.project.id}.zip`;

        this.logger.log(
          `Deleting upload path ${uploadPath} for project ${source.project.id}`,
        );

        if (fs.existsSync(uploadPath)) {
          this.logger.log(
            `Removing existing upload path ${uploadPath} for project ${source.project.id}`,
          );
          fs.rmSync(uploadPath, { recursive: true });
          this.logger.log(
            `Successfully removed upload path ${uploadPath} for project ${source.project.id}`,
          );
          return;
        }
        this.logger.log(
          `Upload path ${uploadPath} does not exist for project ${source.project.id}`,
        );
        break;
      }
    }
  }

  async deleteSource(sourceId: string) {
    return this.sourceRepository.delete(sourceId);
  }

  async updateSourceSettings(
    sourceId: string,
    updateData: Partial<SourceSettingsDto>,
  ) {
    return this.sourceRepository.updateSettings(sourceId, updateData);
  }
}
