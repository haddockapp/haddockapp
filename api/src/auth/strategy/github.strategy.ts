import { BadRequestException, Injectable, InternalServerErrorException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import axios from "axios";
import { Strategy } from "passport-custom";
import { GithubService } from "src/github/github.service";
import { UserRepository } from "src/user/user.repository";
import { AuthorizationEnum } from "../../authorization/types/authorization.enum";
import { ConnectGithubDto } from "../dto/ConnectGithub.dto";
import { AuthError } from "../error/AuthError";
import { AuthorizationService } from "../../authorization/authorization.service";

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
    constructor(
        private githubService: GithubService,
        private userRepository: UserRepository,
        private authorizationService: AuthorizationService,
    ) {
        super();
    }

    private async connectGithubViaCode(code: string) {
        try {
          return await this.githubService.exchangeCode(code);
        } catch (e) {
          console.error(e);

          if (e instanceof AuthError) {
            throw new BadRequestException(e.message);
          }
          throw new InternalServerErrorException('An error occurred.');
        }
      }

    async validate(req: Request, done: Function) {
        // @ts-ignore
        const { code } = req.body as ConnectGithubDto;
        const accessToken = await this.connectGithubViaCode(code);

        let username: string;
        let useremail: string;
        try {
            const userInfos = await this.githubService.getUserInfos(accessToken);
            username = userInfos.login;

            useremail = await this.githubService.getUserPrimaryEmail(accessToken);
        } catch (e) {
            console.log(e);
            throw new InternalServerErrorException('');
        }

        if (!useremail || !username) {
            throw new InternalServerErrorException('');
        }

        let user = await this.userRepository.findByEmail(useremail);
        if (!user) {
            const createdUser = await this.userRepository.createUser(useremail, username);
            await this.authorizationService.createAuthorization({
              type: AuthorizationEnum.OAUTH,
              data: {
                token: accessToken,
              }
            });
            user = { ...createdUser };
        }

        done(null, user);
    }
}
