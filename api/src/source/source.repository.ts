import { Injectable, NotFoundException } from '@nestjs/common';
import { Source } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { PersistedSourceDto, SourceDto } from './dto/source.dto';
import { SourceSettingsDto } from './dto/settings.dto';
import { getSettings } from './utils/get-settings';

@Injectable()
export class SourceRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async findById(id: string): Promise<PersistedSourceDto | null> {
    return this.prismaService.source.findUniqueOrThrow({
      where: { id },
      include: {
        authorization: true,
        project: true,
      },
    });
  }

  async createSource(source: SourceDto): Promise<Source | null> {
    return this.prismaService.source.create({
      data: {
        type: source.type,
        settings: source.settings,
        authorization: source.authorizationId
          ? {
              connect: { id: source.authorizationId },
            }
          : undefined,
      },
    });
  }

  async updateSettings(
    id: string,
    updateData: Partial<SourceSettingsDto>,
  ): Promise<Source> {
    // Get existing settings
    const source = await this.prismaService.source.findUnique({
      where: { id },
      select: { settings: true },
    });

    if (!source) {
      throw new NotFoundException(`Source with id ${id} not found`);
    }

    const currentSettings = getSettings<SourceSettingsDto>(source.settings);

    // Merge settings
    const mergedSettings = {
      ...currentSettings,
      ...updateData,
    };

    return this.prismaService.source.update({
      where: { id },
      data: {
        settings: mergedSettings,
      },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prismaService.source.delete({
      where: { id },
    });
  }
}
