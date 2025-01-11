import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from './auth.decorator';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from './user.context';
import { User } from '@prisma/client';
import { SignupDto } from './dto/Signup.dto';
import { SigninDto } from './dto/Signin.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @UseGuards(AuthGuard('github'))
  @Post('github')
  async connectGithub(@CurrentUser() user: User) {
    const jwt = this.authService.generateJwt(user);
    return { accessToken: jwt };
  }

  @Public()
  @Post('signup')
  async standardSignup(
    @Query('code') invitationCode: string | undefined,
    @Body() body: SignupDto,
  ) {
    const user = await this.authService.signup(body, invitationCode);
    const jwt = await this.authService.generateJwt(user);
    return { accessToken: jwt };
  }

  @Public()
  @Post('signin')
  async standardSignin(@Body() body: SigninDto) {
    const user = await this.authService.signin(body);
    const jwt = await this.authService.generateJwt(user);
    return { accessToken: jwt };
  }

  @Get('authenticated')
  async isUserAuthenticated(@Req() req: Request) {
    const authorization = req.headers['Authorization']?.split(' ') || [];
    if (authorization.length !== 2 || authorization[0] !== 'Bearer') {
      throw new UnauthorizedException('');
    }

    return true;
  }
}
