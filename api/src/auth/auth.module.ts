import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { AuthorizationModule } from "src/authorization/authorization.module";
import { UserModule } from "src/user/user.module";
import { GithubModule } from "../github/github.module";
import { PrismaModule } from "../prisma/prisma.module";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { JwtAuthGuard } from "./guard/jwt.guard";
import { GithubStrategy } from "./strategy/github.strategy";
import { JwtStrategy } from "./strategy/jwt.strategy";
import { ConfigurationModule } from "../configuration/configuration.module";

@Module({
    imports: [
        PassportModule,
        JwtModule.register({ global: true, secret: process.env.JWT_SECRET, signOptions: { expiresIn: '1d' } }),
        PrismaModule,
        GithubModule,
        UserModule,
        AuthorizationModule,
        ConfigurationModule,
    ],
    providers: [AuthService,  JwtStrategy, GithubStrategy, { provide: APP_GUARD, useClass: JwtAuthGuard }],
    controllers: [AuthController],
    exports: []
})
export class AuthModule { }
