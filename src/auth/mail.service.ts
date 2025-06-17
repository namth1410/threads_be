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

  async sendResetPasswordEmail(email: string, token: string) {
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

    await this.mailerService.sendMail({
      to: email,
      subject: 'Khôi phục mật khẩu',
      html: `<p>Nhấn vào liên kết để đặt lại mật khẩu: <a href="${resetLink}">Đặt lại mật khẩu</a></p>`,
    });
  }
}
