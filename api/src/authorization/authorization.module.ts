import { Module } from "@nestjs/common";
import { PrismaModule } from "src/prisma/prisma.module";
import { AuthorizationEntityService } from "./authorization-entity.service";
import { AuthorizationController } from "./authorization.controller";
import { AuthorizationMapper } from "./authorization.mapper";
import { AuthorizationRepository } from "./authorization.repository";
import { AuthorizationService } from "./authorization.service";
import { AuthorizationValidator } from "./authorization.validator";

@Module({
    imports: [PrismaModule],
    providers: [AuthorizationService, AuthorizationEntityService, AuthorizationRepository, AuthorizationMapper, AuthorizationValidator],
    controllers: [AuthorizationController],
    exports: [AuthorizationService],
})
export class AuthorizationModule { }
