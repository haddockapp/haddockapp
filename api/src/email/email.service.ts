import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { InvitationTemplate } from './types/invitation-template.type';
import { ResetPasswordTemplate } from './types/reset-password-template.type';
import { join } from 'path';

@Injectable()
export class EmailService {
  constructor(private readonly mailerService: MailerService) {}

  private async sendMail<T>(body: {
    from?: User;
    to: string;
    subject: string;
    template: string;
    context: T;
  }) {
    const { from, to, subject, template, context } = body;

    await this.mailerService.sendMail({
      to /*: 'leo.dubosclard@epitech.eu'*/,
      from: `"${from.name}" <${from.email}>`,
      subject,
      template,
      context,
    });
  }

  async sendInvitation(inviter: User, userEmail: string, code: string) {
    const context: InvitationTemplate = {
      inviterName: inviter.name,
      invitationLink: `http://localhost:4000/auth/signup?code=${code}`,
    };

    await this.sendMail<InvitationTemplate>({
      from: inviter,
      to: userEmail,
      subject: `${inviter.name} vous invite à rejoindre Haddock`,
      template: 'invitation',
      context,
    });
  }

  async sendPasswordReset(userId: string, userEmail: string, code: string) {
    const context: ResetPasswordTemplate = {
      resetLink: `http://localhost:4000/user/${userId}/password/reset?code=${code}`,
    };

    await this.sendMail<ResetPasswordTemplate>({
      to: userEmail,
      subject: `Réinitialisation de votre mot-de-passe`,
      template: 'password-reset',
      context,
    });
  }
}
