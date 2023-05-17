import { Injectable, Scope } from '@nestjs/common';
import {
  Client,
  LocalAuth,
  MessageSendOptions,
  MessageContent,
  Buttons,
} from 'whatsapp-web.js';
import { WebhookService } from '../wpp.webhook.service';
import { WppMessage } from '../dto/intenalMessage.dto';
import { DataBaseService } from '../database.service';
import { ClientDTO } from '../dto/client.dto';
import path from 'path';

type ButtonSpec = {
  id?: string;
  body: string;
};

enum WppClientStatus {
  INITIALIZING = 0,
  AUTHENTICATING = 1,
  AUTHENTICATION_SUCCESS = 2,
  AUTHENTICATION_FAILED = 3,
  READY = 4,
  DISCONNECTED = 5,
}

class WppClient extends Client {
  constructor(readonly clientId: string) {
    super({
      authStrategy: new LocalAuth({
        clientId,
        dataPath: path.join(__dirname, '/sessions'),
      }),
      puppeteer: {
        headless: true,
      },
    });
  }
  qr: string;
  status: WppClientStatus = 0;
}

@Injectable({ scope: Scope.DEFAULT, durable: true })
class WppClientsService {
  constructor(
    private webhookService: WebhookService,
    private dataBaseService: DataBaseService
  ) {
    this.init();
  }
  private clients: WppClient[] = [];

  async init() {
    const storedClients = await this.dataBaseService.botFindAll();
    storedClients.forEach(async (bot) => {
      await this.add(bot, false);
    });
  }

  async add(clientInfos: ClientDTO, store = true) {
    const clientExists = this.clients.some(
      (client) => client.clientId === clientInfos.botId
    );
    if (clientExists) {
      return false;
    }

    const newClient = new WppClient(clientInfos.botId);

    newClient.on('qr', (qr) => {
      newClient.qr = qr;
      newClient.status = 1;
      console.log(`WPP CLIENT | ${clientInfos.botId} QR RECEIVED`, qr);
    });

    newClient.on('authenticated', () => {
      newClient.status = 2;
      console.log(`WPP CLIENT | ${clientInfos.botId} AUTHENTICATED`);
    });

    newClient.on('auth_failure', (message) => {
      newClient.status = 3;
      console.log(
        `WPP CLIENT | ${clientInfos.botId} AUTHENTICATION FAILED with message: ${message}`
      );
    });

    newClient.on('ready', () => {
      newClient.status = 4;
      console.log(`WPP CLIENT | ${clientInfos.botId} Client is ready!`);

      this.sendButtons(clientInfos.botId, '553284680116@c.us', {
        body: 'teste',
        buttons: [{ body: 'botaoTeste', id: '1' }],
        title: 'testeTitulo',
        footer: 'testeFoot',
      });
    });

    newClient.on('disconnected', (reason) => {
      newClient.status = 5;
      console.log(
        `WPP CLIENT | ${clientInfos.botId} Client disconnected by the reason: ${reason}`
      );
    });

    newClient.on('message', async (msg: WppMessage) => {
      msg.botId = clientInfos.botId;
      await this.storeMessage(msg);
    });

    this.clients.push(newClient);
    try {
      newClient.initialize();
    } catch (error) {
      console.error(`WPP CLIENT | ${clientInfos.botId} Error on initialize:`, error);
    }

    if (store) {
      return await this.dataBaseService.botCreate(clientInfos);
    }
    return clientInfos;
  }

  async storeMessage(msg: WppMessage) {
    console.log(msg);
    await this.webhookService.sendMessage(msg);
  }

  getClient(clientId: string) {
    const index = this.clients.findIndex((client) => client.clientId === clientId);
    if (index !== -1 && this.clients[index].status === 1) {
      return this.clients[index];
    }
    return false;
  }

  get clientsList() {
    return this.clients.map((client) => {
      return {
        clientId: client.clientId,
        status: client.status,
        qr: client.qr,
      };
    });
  }

  async drop(clientId: string) {
    await this.dataBaseService.botDropById(clientId);
    const index = this.clients.findIndex((client) => client.clientId === clientId);
    if (index !== -1) {
      try {
        await this.clients[index].logout();
      } catch (error) {
        console.error(error);
      }
      this.clients.splice(index, 1);
      return 200;
    }
    return false;
  }

  getClientQr(clientId: string) {
    const index = this.clients.findIndex((client) => client.clientId === clientId);
    if (index !== -1 && this.clients[index].status === 1) {
      return [this.clients[index].status, this.clients[index].qr];
    }
    return [false, false];
  }

  async sendMessageFromClient(
    clientId: string,
    to: string,
    message: MessageContent,
    options: MessageSendOptions = {}
  ) {
    const index = this.clients.findIndex((client) => client.clientId === clientId);
    if (index !== -1 && this.clients[index].status === 4) {
      const msg: WppMessage = {
        botId: clientId,
        ...(await this.clients[index].sendMessage(to, message, options)),
      };
      await this.storeMessage(msg);
      return msg;
    }
    return false;
  }

  async sendButtons(
    clientId: string,
    to: string,
    buttonInfos: { body: string; buttons: ButtonSpec[]; title: string; footer: string }
  ) {
    const buttonsMessage = new Buttons(
      buttonInfos.body,
      buttonInfos.buttons,
      buttonInfos.title,
      buttonInfos.footer
    );

    await this.sendMessageFromClient(clientId, to, buttonsMessage);
  }
}

export { WppClientsService };
