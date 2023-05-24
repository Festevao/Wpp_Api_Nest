import { Injectable, Scope } from '@nestjs/common';
import { create, Whatsapp } from 'venom-bot';
import { WebhookService } from '../wpp.webhook.service';
import { DataBaseService } from '../database.service';
import { ClientDTO } from '../dto/client.dto';
import path from 'path';

enum WppClientStatus {
  INITIALIZING = 0,
  AUTHENTICATING = 1,
  READY = 2,
  DISCONNECTED = 3,
}

@Injectable({ scope: Scope.DEFAULT, durable: true })
class WppClientsService {
  constructor(
    private webhookService: WebhookService,
    private dataBaseService: DataBaseService
  ) {
    this.init();
  }
  private clients: Whatsapp[] = [];
  private clientsInfos: { botId: string; qr: string; status: WppClientStatus }[] = [];

  async init() {
    const storedClients = await this.dataBaseService.botFindAll();
    storedClients.forEach(async (bot) => {
      this.clientsInfos.push({ botId: bot.botId, qr: undefined, status: 0 });
      await this.add(bot, false);
    });
  }

  async add(clientInfos: ClientDTO, store = true) {
    const clientExists = this.clients.some(
      (client) => client.session === clientInfos.botId
    );
    if (clientExists) {
      return false;
    }

    const newClient = await create(
      //session
      clientInfos.botId, //Pass the name of the client you want to start the bot
      //catchQR
      (base64Qrimg, asciiQR, attempts, urlCode) => {
        console.log(`WPP CLIENT | ${clientInfos.botId} QR RECEIVED`, urlCode);
        console.log(asciiQR);
        try {
          const index = this.clientsInfos.findIndex(
            (qr) => qr.botId === clientInfos.botId
          );
          this.clientsInfos[index].qr = urlCode;
          this.clientsInfos[index].status = 1;
        } catch (error) {
          console.error(error);
        }
      },
      // statusFind
      (statusSession, session) => {
        console.log('Status Session: ', statusSession); //return isLogged || notLogged || browserClose || qrReadSuccess || qrReadFail || autocloseCalled || desconnectedMobile || deleteToken || chatsAvailable || deviceNotConnected || serverWssNotConnected || noOpenBrowser || initBrowser || openBrowser || connectBrowserWs || initWhatsapp || erroPageWhatsapp || successPageWhatsapp || waitForLogin || waitChat || successChat
        const index = this.clientsInfos.findIndex((qr) => qr.botId === session);
        if (statusSession === 'isLogged' || statusSession === 'successChat') {
          this.clientsInfos[index].status = 2;
        }
      },
      // options
      {
        folderNameToken: path.join(__dirname, '/sessions'), //folder name when saving tokens
        headless: false, // you should no longer use boolean false or true, now use false, true or 'new' learn more https://developer.chrome.com/articles/new-headless/
        // puppeteerOptions: {}, // Will be passed to puppeteer.launch
        attemptsForceConnectLoad: 4,
        autoClose: 0,
        updatesLog: true,
        disableSpins: true, // Will disable Spinnies animation, useful for containers (docker) for a better log
      },
      // browser callback
      (browser, waPage) => {
        if (typeof browser !== 'string') {
          console.log('Browser PID:', browser.process().pid);
        }
        if (typeof waPage !== 'boolean') {
          waPage.screenshot({ path: 'screenshot.png' });
        }
      }
    );

    newClient.onMessage((msg) => {
      this.storeMessage(msg);
    });

    this.clients.push(newClient);

    if (store) {
      return await this.dataBaseService.botCreate(clientInfos);
    }
    return clientInfos;
  }

  get clientsList() {
    return this.clientsInfos;
  }

  async storeMessage(msg: any) {
    console.log('messsage:', msg);
    if (msg.type !== 'chat') {
      return;
    }
    const msgAux: any = {};
    msgAux.botId = msg.botId;
    if (msg.me) {
      msgAux.from = msg.me.id._serialized;
    } else if (msg.from) {
      msgAux.from = msg.from;
    }
    if (typeof msg.to !== 'string') {
      msgAux.to = msg.to.remote._serialized;
    }
    msgAux.body = msg.body;
    console.log(msgAux);
    await this.webhookService.sendMessage(msgAux);
    await this.dataBaseService.messageCreate(msgAux);
  }

  async drop(clientId: string) {
    await this.dataBaseService.botDropById(clientId);
    const index = this.clients.findIndex((client) => client.session === clientId);
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
    console.log(this.clientsInfos);
    const index = this.clientsInfos.findIndex((qr) => qr.botId === clientId);
    if (index !== -1) {
      return this.clientsInfos[index].qr;
    }
    return false;
  }

  async sendTextFromClient(clientId: string, to: string, text: string) {
    const indexClient = this.clients.findIndex((client) => client.session === clientId);
    const indexStatus = this.clientsInfos.findIndex((info) => info.botId === clientId);
    if (
      indexClient !== -1 &&
      indexStatus !== -1 &&
      this.clientsInfos[indexClient].status === 2
    ) {
      const msg: any = {
        botId: clientId,
        ...(await this.clients[indexClient].sendText(to, text)),
        type: 'chat',
        to,
        body: text,
      };
      await this.storeMessage(msg);
      return msg;
    }
    return false;
  }

  async sendButtonsFromClient(
    clientId: string,
    to: string,
    title: string,
    subtitle: string,
    buttons: any
  ) {
    const indexClient = this.clients.findIndex((client) => client.session === clientId);
    const indexStatus = this.clientsInfos.findIndex((info) => info.botId === clientId);
    if (
      indexClient !== -1 &&
      indexStatus !== -1 &&
      this.clientsInfos[indexClient].status === 2
    ) {
      console.log(to, title, subtitle, buttons);
      const msg: any = {
        botId: clientId,
        ...(await this.clients[indexClient].sendButtons(to, title, buttons, subtitle)),
      };
      await this.storeMessage(msg);
      return msg;
    }
    return false;
  }
}

export { WppClientsService };
