import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';
import { ConfigService } from '@nestjs/config';
import { MailsService } from './mails.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  EmailConfirmationToken,
  PasswordResetToken,
} from '../auth/entities/emails.entity';

@Module({
  imports: [
    MailerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        transport: {
          host: config.get<string>('SMTP_HOST', 'smtp.freesmtpservers.com'),
          port: config.get<number>('SMTP_PORT', 25),
          secure: false, // true for 465, false for others
          auth: {
            user: config.get<string>('SMTP_USER'),
            pass: config.get<string>('SMTP_PASS'),
          },
        },
        defaults: {
          from: config.get<string>('SMTP_FROM', 'user@freesmtpservers.com'),
        },
        template: {
          dir: join(__dirname, '..', 'mails', 'templates'),
          adapter: new HandlebarsAdapter(),
          options: { strict: true },
        },
      }),
    }),
    TypeOrmModule.forFeature([EmailConfirmationToken, PasswordResetToken]),
  ],
  providers: [MailsService],
  exports: [MailsService],
})
export class MailsModule {}
