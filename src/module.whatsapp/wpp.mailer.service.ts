import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import moment from 'moment';

@Injectable()
class WppMailService {
  private devEmails: any;
  constructor(private mailService: MailerService) {
    try {
      this.devEmails = JSON.parse(process.env.ON_ERROR_EMAILS);
    } catch (error) {
      console.log(error);
    }
  }

  async sendErrorMail(error: string, stack: string): Promise<void>;
  async sendErrorMail(error: Error): Promise<void>;
  async sendErrorMail(error: string | Error, stack?: string) {
    if (!this.devEmails) return;
    const time = moment().format();
    if (error instanceof Error) {
      stack = error.stack;
      error = error.toString();
    }
    await this.mailService.sendMail({
      to: JSON.parse(process.env.ON_ERROR_EMAILS),
      from: this.devEmails,
      subject: 'WPP_API Error',
      template: 'error_to_devs',
      context: {
        time,
        error,
        stack,
      },
    });
  }
}
export { WppMailService };
