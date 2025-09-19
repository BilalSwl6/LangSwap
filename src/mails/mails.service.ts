import { Injectable, UnauthorizedException } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import {
  EmailConfirmationToken,
  PasswordResetToken,
} from '../auth/entities/emails.entity';

@Injectable()
export class MailsService {
  constructor(
    @InjectRepository(EmailConfirmationToken)
    private readonly emailConfirmationTokenRepo: Repository<EmailConfirmationToken>,
    @InjectRepository(PasswordResetToken)
    private readonly passwordResetTokenRepo: Repository<PasswordResetToken>,
    private readonly mailerService: MailerService,
  ) {}

  private generateRawAndHashedToken() {
    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto
      .createHash('sha256')
      .update(rawToken)
      .digest('hex');
    return { rawToken, hashedToken };
  }

  async sendUserConfirmation(email: string) {
    const { rawToken, hashedToken } = this.generateRawAndHashedToken();
    const expiresAt = new Date(Date.now() + 1000 * 60 * 15); // 15 min

    // Always clean up old tokens for this email
    await this.emailConfirmationTokenRepo.delete({ email });

    // Insert a fresh token
    await this.emailConfirmationTokenRepo.save({
      email,
      token: hashedToken,
      expiresAt,
    });

    const url = `${process.env.APP_URL}/auth/confirm?token=${rawToken}`;
    const support_url = `${process.env.APP_URL}/support`;

    await this.mailerService.sendMail({
      to: email,
      subject: 'Welcome! Confirm your Email',
      template: './confirmation',
      context: { url, support_url },
    });
  }

  async sendForgetPasswordEmail(email: string) {
    const { rawToken, hashedToken } = this.generateRawAndHashedToken();
    const expiresAt = new Date(Date.now() + 1000 * 60 * 15); // 15 min

    await this.passwordResetTokenRepo.save({
      email,
      token: hashedToken,
      expiresAt,
    });

    const url = `${process.env.APP_URL}/auth/forget?token=${rawToken}`;
    const support_url = `${process.env.APP_URL}/support`;

    await this.mailerService.sendMail({
      to: email,
      subject: 'Reset your password',
      template: './forget-password',
      context: { url, support_url },
    });
  }

  private async validateToken(
    rawToken: string,
    type: 'password_reset' | 'email_confirmation',
  ): Promise<PasswordResetToken | EmailConfirmationToken> {
    const hashedToken = crypto
      .createHash('sha256')
      .update(rawToken)
      .digest('hex');
    const now = new Date();

    const repo =
      type === 'password_reset'
        ? this.passwordResetTokenRepo
        : this.emailConfirmationTokenRepo;

    const tokenEntity = await repo.findOne({
      where: { token: hashedToken, isUsed: false },
    });

    if (!tokenEntity) {
      throw new UnauthorizedException('Invalid token');
    }

    if (tokenEntity.expiresAt < now) {
      throw new UnauthorizedException('Token expired');
    }

    return tokenEntity;
  }

  /** Validate + mark email confirmation token as used */
  async consumeEmailConfirmationToken(rawToken: string) {
    const tokenEntity = await this.validateToken(
      rawToken,
      'email_confirmation',
    );
    await this.emailConfirmationTokenRepo.update(tokenEntity.id, {
      isUsed: true,
    });
    return tokenEntity;
  }

  /** Validate + mark password reset token as used */
  async consumePasswordResetToken(rawToken: string) {
    const tokenEntity = await this.validateToken(rawToken, 'password_reset');
    await this.passwordResetTokenRepo.update(tokenEntity.id, { isUsed: true });
    return tokenEntity;
  }
}
