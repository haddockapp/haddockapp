import {forwardRef, Module} from "@nestjs/common";
import {GithubService} from "./github.service";
import {GithubController} from "./github.controller";
import { AuthorizationModule } from "src/authorization/authorization.module";

@Module({
    imports: [
        forwardRef(() => AuthorizationModule),
    ],
    providers: [GithubService],
    controllers: [GithubController],
    exports: [GithubService],
})
export class GithubModule { }
