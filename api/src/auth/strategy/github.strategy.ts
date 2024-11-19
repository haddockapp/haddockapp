import { BadRequestException, Injectable, InternalServerErrorException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-custom";
import { GithubService } from "src/github/github.service";
import { UserRepository } from "src/user/user.repository";
import { AuthorizationRepository } from "src/authorization/authorization.repository";
import { ConnectGithubDto } from "../dto/ConnectGithub.dto";
import { AuthError } from "../error/AuthError";
import axios from "axios";
import { ConfigurationRepository } from "src/configuration/configuration.repository";

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
    constructor(
        private githubService: GithubService,
        private userRepository: UserRepository,
        private authorizationRepository: AuthorizationRepository,
        private configurationRepository: ConfigurationRepository,
    ) {
        super();
    }

    private async connectGithubViaCode(code: string) {
        const config = await this.configurationRepository.getConfigurationNoThrow();
        if (!config) {
            throw new InternalServerErrorException('No Github OAuth Application setup');
        }

        const CLIENT_ID = config.github_client_id;
        const CLIENT_SECRET = config.github_client_secret;
        const URL = `https://github.com/login/oauth/access_token?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&code=${code}`;

        try {
          const { data } = await axios.post(
            URL,
            {},
            { headers: { Accept: 'application/json' } },
          );
          if (data.error) {
            throw new AuthError(data.error);
          }

          return data.access_token as string;
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
            const authorization = await this.authorizationRepository.createAuthorization(accessToken, createdUser.id);
            user = { ...createdUser, authorization };
        }

        done(null, user);
    }
}
