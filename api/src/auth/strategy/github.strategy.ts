import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-custom';
import { GithubService } from 'src/github/github.service';
import { UserRepository } from 'src/user/user.repository';
import { AuthorizationEnum } from '../../authorization/types/authorization.enum';
import { ConnectGithubDto } from '../dto/ConnectGithub.dto';
import { AuthError } from '../error/AuthError';
import { AuthorizationService } from '../../authorization/authorization.service';
import { UserRoleEnum } from 'src/user/types/user-role.enum';
import { InvitationService } from 'src/invitation/invitation.service';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(
    private githubService: GithubService,
    private userRepository: UserRepository,
    private authorizationService: AuthorizationService,
    private invitationService: InvitationService,
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

  /* eslint-disable @typescript-eslint/ban-types */
  async validate(req: Request, done: Function) {
    // @ts-expect-error req.body is not typed
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
      const count = await this.userRepository.nbUsers();
      const invitation = await this.invitationService.findByEmail(useremail);

      if (!this.invitationService.userCanRegister(count, invitation))
        throw new ForbiddenException();

      const createdUser = await this.userRepository.createUser({
        email: useremail,
        name: username,
        role: count === 0 ? UserRoleEnum.ADMIN : UserRoleEnum.MEMBER,
      });
      await this.authorizationService.createAuthorization({
        name: `OAuth ${username}`,
        type: AuthorizationEnum.OAUTH,
        data: {
          token: accessToken,
        },
      });
      await this.invitationService.deleteInvitation(invitation);

      user = { ...createdUser };
    }

    done(null, user);
  }
}
