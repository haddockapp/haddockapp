import {Module} from "@nestjs/common";
import {PrismaModule} from "../prisma/prisma.module";
import {ProjectController} from "./project.controller";
import {ProjectRepository} from "./project.repository";
import { SourceModule } from "../source/source.module";
import { ComposeModule } from "src/compose/compose.module";
import { DockerModule } from "src/docker/docker.module";

@Module({
    imports: [PrismaModule, SourceModule, ComposeModule, DockerModule],
    controllers: [ProjectController],
    providers: [ProjectRepository],
})
export class ProjectModule {}
