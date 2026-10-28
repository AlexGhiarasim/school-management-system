import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createTransport, type Transporter } from 'nodemailer';

type Language = 'ro' | 'en';

const SMTPS_PORT = 465;

const RESET_EMAIL: Record<
  Language,
  { subject: string; text: (link: string, minutes: number) => string }
> = {
  ro: {
    subject: 'Resetarea parolei',
    text: (link, minutes) =>
      [
        'Am primit o cerere de resetare a parolei pentru contul tău.',
        '',
        `Deschide linkul de mai jos ca să alegi o parolă nouă. Este valabil ${minutes} de minute și poate fi folosit o singură dată.`,
        '',
        link,
        '',
        'Dacă nu ai cerut tu resetarea, ignoră acest mesaj. Parola ta rămâne neschimbată.',
      ].join('\n'),
  },
  en: {
    subject: 'Password reset',
    text: (link, minutes) =>
      [
        'We received a request to reset the password of your account.',
        '',
        `Open the link below to choose a new password. It is valid for ${minutes} minutes and can be used only once.`,
        '',
        link,
        '',
        'If you did not ask for this, ignore this message. Your password stays the same.',
      ].join('\n'),
  },
};

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly transporter: Transporter;
  private readonly from: string;

  constructor(config: ConfigService) {
    const user = config.get<string>('SMTP_USER');
    const port = config.getOrThrow<number>('SMTP_PORT');

    this.from = config.getOrThrow<string>('MAIL_FROM');
    this.transporter = createTransport({
      host: config.getOrThrow<string>('SMTP_HOST'),
      port,
      secure: port === SMTPS_PORT,
      auth: user
        ? { user, pass: config.get<string>('SMTP_PASSWORD') ?? '' }
        : undefined,
      connectionTimeout: 5_000,
      greetingTimeout: 5_000,
      socketTimeout: 10_000,
    });
  }

  sendPasswordReset(
    to: string,
    link: string,
    minutes: number,
    language: Language,
  ): Promise<void> {
    const template = RESET_EMAIL[language];

    return this.send(to, template.subject, template.text(link, minutes));
  }

  // A failed delivery is logged and never reaches the caller, so a request
  // cannot reveal whether an email address belongs to an account.
  private async send(to: string, subject: string, text: string) {
    try {
      await this.transporter.sendMail({ from: this.from, to, subject, text });
    } catch (error) {
      this.logger.error(
        `Could not send an email: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}
