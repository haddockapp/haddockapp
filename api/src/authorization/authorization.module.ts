import { Module } from "@nestjs/common";
import { PrismaModule } from "src/prisma/prisma.module";
import { AuthorizationMapper } from "./authorization.mapper";
import { AuthorizationRepository } from "./authorization.repository";
import { AuthorizationService } from "./authorization.service";
import { AuthorizationEntityService } from "./authorization-entity.service";
import { AuthorizationController } from "./authorization.controller";

@Module({
    imports: [PrismaModule],
    providers: [AuthorizationService, AuthorizationEntityService, AuthorizationRepository, AuthorizationMapper],
    controllers: [AuthorizationController],
    exports: [AuthorizationService],
})
export class AuthorizationModule { }
