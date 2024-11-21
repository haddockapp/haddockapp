import { Injectable } from "@nestjs/common";
import { AppConfiguration } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class ConfigurationRepository {
    constructor(private readonly prismaService: PrismaService) {}

    async createConfiguration(data: Partial<Omit<AppConfiguration, 'id'>>) {
        return this.prismaService.appConfiguration.create({
            data,
        });
    }

    async getConfiguration() {
        return this.prismaService.appConfiguration.findFirstOrThrow();
    }

    async getConfigurationNoThrow() {
        return this.prismaService.appConfiguration.findFirst();
    }

    async updateConfiguration(configId: string, data: Partial<Omit<AppConfiguration, 'id'>>) {
        return this.prismaService.appConfiguration.update({
            where: {
                id: configId,
            },
            data,
        });
    }
}
