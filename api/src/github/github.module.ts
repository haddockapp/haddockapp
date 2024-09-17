import {Module} from "@nestjs/common";
import {GithubService} from "./github.service";
import {GithubController} from "./github.controller";
import { AuthorizationModule } from "src/authorization/authorization.module";

@Module({
    imports: [AuthorizationModule],
    providers: [GithubService],
    controllers: [GithubController],
    exports: [GithubService],
})
export class GithubModule { }
