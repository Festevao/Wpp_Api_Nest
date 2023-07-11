import { Injectable, Scope } from '@nestjs/common';
import { Client, LocalAuth, Buttons } from 'whatsapp-web.js';
import { WebhookService } from '../wpp.webhook.service';
import { WppMessage } from '../dto/intenalMessage.dto';
import { DataBaseService } from '../database/services/database.service';
import { DataBaseCampaignService } from '../database/services/database.campaign.service';
import { ClientDTO, ClientStatus } from '../dto/client.dto';
import path from 'path';

type ButtonSpec = {
  id?: string;
  body: string;
};

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
  status: ClientStatus = 0;
}

@Injectable({ scope: Scope.DEFAULT, durable: true })
class WppClientsService {
  constructor(
    private webhookService: WebhookService,
    private dataBaseService: DataBaseService,
    private dataBaseCampaignService: DataBaseCampaignService
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
      const contactNumber = msg.from;
      await this.campaignUpdateOnInteraction(contactNumber, msg.botId);
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

  getClientStatus(clientId: string) {
    const index = this.clients.findIndex((client) => client.clientId === clientId);
    if (index !== -1) {
      return this.clients[index].status;
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
      return this.clients[index].qr;
    }
    return false;
  }

  async sendTextFromClient(clientId: string, to: string, text: any) {
    if (to.startsWith('+')) {
      to = to.split('+')[1] + '@c.us';
    }
    if (!to.endsWith('@c.us')) {
      to = to + '@c.us';
    }
    const index = this.clients.findIndex((client) => client.clientId === clientId);
    if (index !== -1 && this.clients[index].status === 4) {
      const msg: WppMessage = {
        botId: clientId,
        ...(await this.clients[index].sendMessage(to, text)),
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

    await this.sendTextFromClient(clientId, to, buttonsMessage);
  }

  async campaignUpdateOnInteraction(contactNumber: string, botId: string) {
    contactNumber = contactNumber.replace(/\D/g, '');
    const activeCampaigns = await this.dataBaseCampaignService.findActives();

    for (let i = 0; i < activeCampaigns.length; i++) {
      if (activeCampaigns[i].botId.botId !== botId) {
        continue;
      }

      const stepsToWait = activeCampaigns[i].campaingSteps
        .map((step, index) => (step.type === 'waitForInteraction' ? index : -1))
        .filter((index) => index !== -1);

      activeCampaigns[i].numbersToSend.forEach((numberInfo) => {
        if (
          stepsToWait.includes(numberInfo.state) &&
          numberInfo.number === contactNumber
        ) {
          numberInfo.state++;
        }
      });
      await this.dataBaseCampaignService.update(activeCampaigns[i]);
    }
  }
}

export { WppClientsService };
