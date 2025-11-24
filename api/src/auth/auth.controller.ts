import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from './auth.decorator';
import { AuthGuard } from '@nestjs/passport';
import { SamlAuthGuard } from './guard/saml.guard';
import { CurrentUser } from './user.context';
import { User } from '@prisma/client';
import { SignupDto } from './dto/Signup.dto';
import { Request, Response } from 'express';
import { AutologinsService } from '../autologins/autologins.service';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private autologinsService: AutologinsService,
  ) {}

  @Public()
  @UseGuards(AuthGuard('github'))
  @Post('github')
  async connectGithub(@CurrentUser() user: User) {
    const jwt = this.authService.generateJwt(user);
    return { accessToken: jwt };
  }

  @Public()
  @Get('saml')
  @UseGuards(SamlAuthGuard)
  async samlLogin() {
    // This will redirect to the SAML IdP
    // The actual redirect is handled by passport-saml
    // Config is refreshed by SamlAuthGuard before authentication
  }

  @Public()
  @Post('saml/callback')
  @UseGuards(SamlAuthGuard)
  async samlCallbackPost(
    @CurrentUser() user: User,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    // Generate autologin token (UUID) instead of JWT
    const autologinToken = await this.autologinsService.generateToken(user.id);

    // Redirect to frontend with autologin token
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const redirectUrl = `${frontendUrl}/autologin?token=${autologinToken}`;

    return res.redirect(redirectUrl);
  }

  @Public()
  @Get('saml/callback')
  @UseGuards(SamlAuthGuard)
  async samlCallbackGet(
    @CurrentUser() user: User,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    // Generate autologin token (UUID) instead of JWT
    const autologinToken = await this.autologinsService.generateToken(user.id);

    // Redirect to frontend with autologin token
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const redirectUrl = `${frontendUrl}/autologin?token=${autologinToken}`;

    return res.redirect(redirectUrl);
  }

  @Public()
  @Post('signup')
  async standardSignup(@Body() body: SignupDto) {
    const user = await this.authService.signup(body);
    const jwt = await this.authService.generateJwt(user);
    return { accessToken: jwt };
  }

  @Public()
  @Post('signin')
  @UseGuards(AuthGuard('local'))
  async standardSignin(@CurrentUser() user: User) {
    const jwt = await this.authService.generateJwt(user);
    return { accessToken: jwt };
  }

  @Get('authenticated')
  async isUserAuthenticated(@Req() req: Request) {
    const authHeader =
      req.headers['authorization'] || req.headers['Authorization'];
    const authValue = Array.isArray(authHeader) ? authHeader[0] : authHeader;
    const authorization = authValue?.split(' ') || [];
    if (authorization.length !== 2 || authorization[0] !== 'Bearer') {
      throw new UnauthorizedException('');
    }

    return true;
  }
}
