import { Injectable } from '@nestjs/common';
import axios, { AxiosHeaders } from 'axios';
import moment from 'moment';

@Injectable()
class WebhookService {
  private async makePostRequest(url: string, data: object) {
    try {
      const response = await axios.post(
        url,
        { data },
        {
          headers: new AxiosHeaders({ 'Content-Type': 'application/json' }),
          timeout: 10000,
        }
      );
      return response.status >= 200 && response.status <= 299;
    } catch (error) {
      return error;
    }
  }

  private getClientEndPoint(costummerToken: string) {
    return ['', ''];
  }

  private encodeMessage(message: object) {
    return '';
  }

  async sendMessage(costummerToken: string, message: object) {
    const [endPoint, costummer] = this.getClientEndPoint(costummerToken);

    const webhookResponse = await this.makePostRequest(endPoint, message);

    if (webhookResponse instanceof Error) {
      console.log(
        moment().format(),
        `Webhook error on send to ${costummer} | EndPoint: ${endPoint} | Message: ${webhookResponse.message}`
      );
    }
  }
}

export { WebhookService };
