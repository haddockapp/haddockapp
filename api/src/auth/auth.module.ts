import {Module} from "@nestjs/common";
import {AuthController} from "./auth.controller";
import {AuthService} from "./auth.service";
import {PrismaModule} from "../prisma/prisma.module";
import {GithubModule} from "../github/github.module";
import { UserModule } from "src/user/user.module";
import { PassportModule } from "@nestjs/passport";
import { JwtModule } from "@nestjs/jwt";
import { JwtAuthGuard } from "./guard/jwt.guard";
import { APP_GUARD } from "@nestjs/core";
import { JwtStrategy } from "./strategy/jwt.strategy";
import { AuthorizationModule } from "src/authorization/authorization.module";
import { GithubStrategy } from "./strategy/github.strategy";
import { ConfigurationModule } from "src/configuration/configuration.module";

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
