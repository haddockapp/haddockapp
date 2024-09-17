import {
  Controller,
  Get,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from './auth.decorator';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from './user.context';
import { User } from '@prisma/client';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
  ) {}

  @Public()
  @UseGuards(AuthGuard('github'))
  @Post('github')
  async connectGithub(@CurrentUser() user: User) {
    const jwt = this.authService.generateJwt(user);
    return { accessToken: jwt };
  }

  @Get('authenticated')
  async isUserAuthenticated(@Req() req: Request, @CurrentUser() user: User) {
    const authorization = req.headers['Authorization']?.split(' ') || [];
    if (authorization.length !== 2 || authorization[0] !== 'Bearer') {
      throw new UnauthorizedException('');
    }

    return true;
  }
}
