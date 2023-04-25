import { Injectable, Scope } from '@nestjs/common';
import { Client, LocalAuth, Location, MessageSendOptions } from 'whatsapp-web.js';
import { WebhookService } from '../wpp.webhook.service';
import { WppMessage } from '../dto/intenalMessage.dto';
import { DataBaseService } from '../database.service';
import { ClientDTO } from '../dto/client.dto';
import { BaseMessageDTO } from '../dto/messages.body/baseMessage.body.dto';
import path from 'path';

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
        headless: false,
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
    });

    newClient.on('disconnected', (reason) => {
      newClient.status = 5;
      console.log(
        `WPP CLIENT | ${clientInfos.botId} Client disconnected by the reason: ${reason}`
      );
    });

    newClient.on('message', async (msg: WppMessage) => {
      msg.botId = clientInfos.botId;
      await this.webhookService.sendMessage(msg);
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

  getClient(clientId: string) {
    const index = this.clients.findIndex((client) => client.clientId === clientId);
    if (index !== -1 && this.clients[index].status === 1) {
      return this.clients[index];
    }
    return false;
  }

  drop(clientId: string) {
    const index = this.clients.findIndex((client) => client.clientId === clientId);
    if (index !== -1) {
      this.clients[index].destroy();
      this.clients.splice(index, 1);
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

  private buildMessage(messageData: BaseMessageDTO) {
    const data = messageData.data as any;
    let message;
    let aditionalOptions = {};
    if (data.text) {
      message = data.text;
    }
    if (data.latitude && data.longitude) {
      data.description = data.description
        ? data.description
        : `${data.latitude} ${data.longitude}`;
      message = `https://www.google.com/maps/search/?api=1&query=${data.latitude},${data.longitude}`;
      aditionalOptions = { linkPreview: true };
    }
    console.log('to:', `${messageData.to.split('+')[1]}@c.us`);
    console.log('message:', message);
    return [`${messageData.to.split('+')[1]}@c.us`, message, aditionalOptions];
  }

  async sendMessageFromClient(
    clientId: string,
    messageData: BaseMessageDTO,
    options: MessageSendOptions = {}
  ) {
    const index = this.clients.findIndex((client) => client.clientId === clientId);
    if (index !== -1 && this.clients[index].status === 4) {
      const [to, message, aditionalOptions] = this.buildMessage(messageData);
      console.log(Object.assign(options, aditionalOptions));
      console.log(options);
      const msg: WppMessage = {
        botId: clientId,
        ...(await this.clients[index].sendMessage(to, message, options)),
      };
      await this.webhookService.sendMessage(msg);
      return msg;
    }
    return false;
  }
}

export { WppClientsService };
