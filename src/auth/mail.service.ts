import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendVerificationEmail(email: string, token: string) {
    const verifyUrl = `http://localhost:4000/auth/verify?token=${token}`;

    await this.mailerService.sendMail({
      to: email,
      subject: 'Xác thực tài khoản',
      template: './verify', // templates/verify.hbs
      context: {
        email,
        verifyUrl,
      },
    });
  }
}
