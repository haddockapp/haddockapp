import { Module } from "@nestjs/common";
import { PrismaModule } from "src/prisma/prisma.module";
import { AuthorizationRepository } from "./authorization.repository";

@Module({
    imports: [PrismaModule],
    providers: [AuthorizationRepository],
    exports: [AuthorizationRepository],
})
export class AuthorizationModule { }
