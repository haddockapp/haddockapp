import { Module } from "@nestjs/common";
import { PrismaModule } from "src/prisma/prisma.module";
import { ConfigurationController } from "./configuration.controller";
import { ConfigurationRepository } from "./configuration.repository";

@Module({
    imports: [PrismaModule],
    controllers: [ConfigurationController],
    providers: [ConfigurationRepository],
    exports: [ConfigurationRepository],
})
export class ConfigurationModule {}
