import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-saml';
import { UserRepository } from 'src/user/user.repository';
import { UserRoleEnum } from 'src/user/types/user-role.enum';
import { InvitationService } from 'src/invitation/invitation.service';
import { ConfigurationService } from 'src/configuration/configuration.service';
import { Request } from 'express';

export interface SamlProfile {
  issuer?: string;
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'?: string;
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'?: string;
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'?: string;
  'http://schemas.microsoft.com/identity/claims/displayname'?: string;
  email?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  [key: string]: any;
}

@Injectable()
export class SamlStrategy extends PassportStrategy(Strategy, 'saml') {
  private samlConfig: any;

  constructor(
    private userRepository: UserRepository,
    private invitationService: InvitationService,
    private configurationService: ConfigurationService,
  ) {
    // Initialize with default config from env vars or placeholder values
    // Will be updated when config is loaded from DB
    // Note: passport-saml requires cert to be non-empty, so we provide a placeholder
    // The guard will ensure valid config exists before authentication
    super({
      callbackUrl: process.env.SAML_CALLBACK_URL || '/auth/saml/callback',
      entryPoint:
        process.env.SAML_ENTRY_POINT || 'https://placeholder.example.com/sso',
      issuer: process.env.SAML_ISSUER || 'placeholder-issuer',
      cert:
        process.env.SAML_CERT ||
        '-----BEGIN CERTIFICATE-----\nPLACEHOLDER\n-----END CERTIFICATE-----',
      signatureAlgorithm: 'sha256',
      acceptedClockSkewMs: 5000,
      identifierFormat:
        'urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress',
      passReqToCallback: true,
      // Disable RequestedAuthnContext to allow Azure AD to use any authentication method
      // (MFA, passwordless, password, etc.) This prevents AADSTS75011 errors
      disableRequestedAuthnContext: true,
    });

    // Load config from DB asynchronously
    this.loadConfigFromDb();
  }

  async loadConfigFromDb() {
    try {
      const config = await this.configurationService.getSamlConfiguration();
      if (config) {
        this.samlConfig = config;
        // Update the strategy's internal configuration
        // Note: This is a workaround as passport-saml doesn't support
        // dynamic reconfiguration after instantiation
        if (this['options']) {
          this['options'].callbackUrl = config.callbackUrl;
          this['options'].entryPoint = config.entryPoint;
          this['options'].issuer = config.issuer;
          this['options'].cert = config.cert;
        }

        // Update the internal SAML instance - passport-saml stores it in _saml
        // We update the options and recreate the SAML instance if it exists
        if (this['_saml'] && this['_saml'].options) {
          // Update the SAML instance options directly
          this['_saml'].options.callbackUrl = config.callbackUrl;
          this['_saml'].options.entryPoint = config.entryPoint;
          this['_saml'].options.issuer = config.issuer;
          this['_saml'].options.cert = config.cert;
        }
      }
    } catch (error) {
      console.error('Failed to load SAML config from DB:', error);
    }
  }

  async authenticate(req: any, options?: any) {
    // Reload config from DB before each authentication
    // This ensures we use the latest config when creating SAML requests
    try {
      await this.loadConfigFromDb();
    } catch (error) {
      console.error('Failed to reload SAML config:', error);
      // Still try to authenticate with existing config
    }
    return super.authenticate(req, options);
  }

  async validate(
    req: Request,
    profile: SamlProfile,
    done: (error: any, user?: any) => void,
  ): Promise<void> {
    // Refresh config from DB to ensure it's up to date
    await this.loadConfigFromDb();

    try {
      // Extract email from SAML profile
      const useremail =
        profile[
          'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'
        ] ||
        profile.email ||
        profile[
          'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'
        ];

      // Extract name from SAML profile
      const username =
        profile['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] ||
        profile['http://schemas.microsoft.com/identity/claims/displayname'] ||
        profile.name ||
        `${profile.firstName || ''} ${profile.lastName || ''}`.trim() ||
        useremail?.split('@')[0] ||
        'Unknown User';

      if (!useremail)
        throw new InternalServerErrorException(
          'Email not found in SAML response',
        );

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

        // Note: SAML authentication doesn't require storing authorization tokens
        // unlike OAuth which needs to store access tokens for API calls

        if (invitation) {
          await this.invitationService.deleteInvitation(invitation);
        }

        user = { ...createdUser };
      }

      done(null, user);
    } catch (error) {
      if (
        error instanceof ForbiddenException ||
        error instanceof InternalServerErrorException
      ) {
        done(error, null);
      } else {
        console.error('SAML validation error:', error);
        done(
          new InternalServerErrorException('SAML authentication failed'),
          null,
        );
      }
    }
  }
}
