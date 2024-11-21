import { Module } from "@nestjs/common";
import { PrismaModule } from "src/prisma/prisma.module";
import { ConfigurationRepository } from "./configuration.repository";

@Module({
    imports: [PrismaModule],
    controllers: [],
    providers: [ConfigurationRepository],
    exports: [ConfigurationRepository],
})
export class ConfigurationModule {}
