import { Injectable } from '@nestjs/common';
import moment from 'moment';

@Injectable()
class WebhookService {
  private fetchTimeout(
    url: string,
    ms: number,
    { signal, ...options } = { signal: undefined, options: {} }
  ) {
    const controller = new AbortController();
    const promise = fetch(url, { signal: controller.signal, ...options });
    if (signal) signal.addEventListener('abort', () => controller.abort());
    const timeout = setTimeout(() => controller.abort(), ms);
    return promise.finally(() => clearTimeout(timeout));
  }

  private getClientEndPoint(costummerToken: string) {
    return ['', ''];
  }

  private encodeMessage(message: object) {
    return '';
  }

  async sendMessage(costummerToken: string, message: object) {
    const headersJson = {
      'Content-Type': 'application/json',
    };
    const fetchOptions = {
      method: 'POST',
      headers: headersJson,
      body: JSON.stringify(this.encodeMessage(message)),
      redirect: 'follow',
    };

    const [endPoint, costummer] = this.getClientEndPoint(costummerToken);

    const webhookResponse = await this.fetchTimeout(endPoint, 10000, fetchOptions as any);

    if (webhookResponse.status < 200 || webhookResponse.status >= 300) {
      console.log(
        moment().format(),
        `Webhook error on send to ${costummer} | EndPoint: ${endPoint} | Status: ${webhookResponse.status}`
      );
    }
  }
}

export { WebhookService };
