import { Module } from "@nestjs/common";
import { PrismaModule } from "src/prisma/prisma.module";
import { AuthorizationMapper } from "./authorization.mapper";
import { AuthorizationRepository } from "./authorization.repository";
import { AuthorizationService } from "./authorization.service";

@Module({
    imports: [PrismaModule],
    providers: [AuthorizationService, AuthorizationRepository, AuthorizationMapper],
    exports: [AuthorizationService],
})
export class AuthorizationModule { }
