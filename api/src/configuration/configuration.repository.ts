import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ConfigurationRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async createConfiguration(key: string, value: Prisma.JsonValue) {
    return this.prismaService.appConfiguration.create({
      data: {
        key,
        value,
      },
    });
  }

  async getConfiguration() {
    return this.prismaService.appConfiguration.findMany();
  }

  async getConfigurationByKey(key: string) {
    return this.prismaService.appConfiguration.findFirst({
      where: {
        key,
      },
    });
  }

  async getConfigurationByKeys(keys: string[]) {
    return this.prismaService.appConfiguration.findMany({
      where: {
        key: {
          in: keys,
        },
      },
    });
  }

  async updateConfiguration(key: string, value: Prisma.JsonValue) {
    return this.prismaService.appConfiguration.update({
      where: {
        key,
      },
      data: {
        value,
      },
    });
  }
}
