import { Injectable, Scope } from '@nestjs/common';
import { WppClientsService } from './wppClientUtils/clients.service.old';
import { DataBaseCampaignService } from './database/services/database.campaign.service';
import { Campaign } from './database/models/campaign.entity';

@Injectable({ scope: Scope.DEFAULT, durable: true })
class CampaignService {
  constructor(
    private wppClientsService: WppClientsService,
    private dataBaseCampaignService: DataBaseCampaignService
  ) {
    setInterval(async () => {
      await this.startActiveCampaigns();
    }, 10000);
  }

  private runningCampaigns: string[] = [];

  private async waitBotReady(botId: string, timeout: number) {
    const startTime = Date.now();
    while (true) {
      const botStatus = this.wppClientsService.getClientStatus(botId);

      if (botStatus === 4) {
        return true;
      } else if (botStatus === 3 || botStatus === 5) {
        return false;
      }

      const currentTime = Date.now();
      const elapsedTime = currentTime - startTime;

      if (elapsedTime >= timeout) {
        return false;
      }

      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  private checkBlockTimeout(lastBlockExecution: Date, timeoutInSeconds: number) {
    const timeoutInMillis = timeoutInSeconds * 1000;
    const expirationTime = lastBlockExecution.getTime() + timeoutInMillis;
    const currentTime = new Date().getTime();

    return expirationTime < currentTime;
  }

  private async executeCampaign(campaignObj: Campaign) {
    if (!this.runningCampaigns.includes(campaignObj.campaignId)) {
      this.runningCampaigns.push(campaignObj.campaignId);
    } else {
      return;
    }

    let blockCont = 0;
    for (
      let i = 0;
      i < campaignObj.numbersToSend.length && blockCont < campaignObj.chatsPerBlock;
      i++
    ) {
      const atualMessageStateIndex = campaignObj.numbersToSend[i].state;
      if (atualMessageStateIndex >= campaignObj.campaingSteps.length) {
        blockCont--;
        continue;
      }
      if (
        campaignObj.lastBlockExecution &&
        atualMessageStateIndex === 0 &&
        this.checkBlockTimeout(campaignObj.lastBlockExecution, campaignObj.blockInterval)
      ) {
        continue;
      }
      const atualMessageStateObj = campaignObj.campaingSteps[atualMessageStateIndex];
      switch (atualMessageStateObj?.type) {
        case 'txt':
          await this.wppClientsService.sendTextFromClient(
            campaignObj.botId.botId,
            campaignObj.numbersToSend[i].number,
            atualMessageStateObj.body
          );
        case 'media':
          await new Promise((resolve) =>
            setTimeout(resolve, campaignObj.messageInterval * 1000)
          );
          if (campaignObj.numbersToSend[i].state === 0) {
            blockCont++;
          }
          campaignObj.numbersToSend[i].state++;
          i--;
          break;
        default:
          break;
      }
    }

    campaignObj.lastBlockExecution = new Date();
    const campaignIndex = this.runningCampaigns.findIndex(
      (element) => element === campaignObj.campaignId
    );
    this.runningCampaigns.splice(campaignIndex, 1);

    this.dataBaseCampaignService.update(campaignObj);
  }

  private async startActiveCampaigns() {
    const activeCampaigns = await this.dataBaseCampaignService.findActives();
    activeCampaigns.forEach(async (campaignObj) => {
      const botIsOn = await this.waitBotReady(campaignObj.botId.botId, 9000);
      if (!botIsOn) return;

      await this.executeCampaign(campaignObj);
    });
  }
}

export { CampaignService };
