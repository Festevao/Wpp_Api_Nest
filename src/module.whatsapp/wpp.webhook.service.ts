import { Injectable } from '@nestjs/common';
import axios, { AxiosHeaders } from 'axios';
import { DataBaseService } from './database.service';
import { WppMailService } from './wpp.mailer.service';
import CryptoJS from 'crypto-js';
import { WppMessage } from './dto/intenalMessage.dto';

@Injectable()
class WebhookService {
  constructor(
    private dataBaseService: DataBaseService,
    private wppMailService: WppMailService
  ) {}
  private async makePostRequest(url: string, data: string) {
    try {
      const response = await axios.post(
        url,
        { data },
        {
          headers: new AxiosHeaders({ 'X-Encrypted': true }),
          timeout: 10000,
        }
      );
      return response.status >= 200 && response.status <= 299;
    } catch (error) {
      console.error(error);
      this.wppMailService.sendErrorMail(error);
      return null;
    }
  }

  private async getMessageInfos(botId: string) {
    try {
      const bot = await this.dataBaseService.botFindById(botId);
      if (!(bot.alias || bot.botId)) {
        const error = new Error(
          `Webhook, error on find botId to user "${bot.userId}" on url ${bot.webhookUrl}`
        );
        console.error(error);
        this.wppMailService.sendErrorMail(error);
        return [null, null, null];
      }
      if (!bot.encodeToken) {
        const error = new Error(
          `Webhook, error on find encodeToken to user "${bot.userId}" on url ${bot.webhookUrl}`
        );
        console.error(error);
        this.wppMailService.sendErrorMail(error);
        return [null, null, null];
      }
      return [bot.webhookUrl, bot.alias || bot.botId, bot.encodeToken];
    } catch (error) {
      console.error(error);
      this.wppMailService.sendErrorMail(error);
      return [null, null, null];
    }
  }

  private encodeMessage(message: WppMessage, encodeToken: string) {
    const stringMessage = JSON.stringify(message);
    return CryptoJS.AES.encrypt(stringMessage, encodeToken).toString();
  }

  async sendMessage(message: WppMessage) {
    const [endPoint, botId, encodeToken] = await this.getMessageInfos(message.botId);
    if (!endPoint) {
      return;
    }

    message.botId = botId;
    const encodedMessage = this.encodeMessage(message, encodeToken);

    await this.makePostRequest(endPoint, encodedMessage);
  }
}

export { WebhookService };
