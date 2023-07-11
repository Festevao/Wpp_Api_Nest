import { Injectable, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Campaign, CampaignStatus } from '../models/campaign.entity';
import { CampaignDTO } from 'src/module.whatsapp/dto/campaign.dto';
import { LessThanOrEqual, MoreThanOrEqual } from 'typeorm';

@Injectable()
class DataBaseCampaignService {
  constructor(
    @Inject('CAMPAIGN_REPOSITORY')
    private campaignRepository: Repository<Campaign>
  ) {}

  async create(campaignInfos: CampaignDTO, botId: string) {
    return await this.campaignRepository.insert({
      ...campaignInfos,
      botId: botId as any,
      numbersToSend: campaignInfos.numbersToSend.map((numberString) => {
        if (numberString.startsWith('+')) {
          return {
            number: numberString.split('+')[1],
            state: 0,
          };
        } else {
          return {
            number: numberString,
            state: 0,
          };
        }
      }),
    });
  }

  async findAll() {
    return await this.campaignRepository.find();
  }

  async findById(campaignId: string) {
    return await this.campaignRepository.findOne({ where: { campaignId } });
  }

  async findActives() {
    const currentDate = new Date();

    return await this.campaignRepository.find({
      where: {
        startDate: LessThanOrEqual(currentDate),
        endDate: MoreThanOrEqual(currentDate),
        status: CampaignStatus.active,
      },
    });
  }

  async findAllByBotId(botId: string) {
    return await this.campaignRepository.find({ where: { botId: botId as any } });
  }

  async update(campaignObj: Campaign) {
    return await this.campaignRepository.save(campaignObj);
  }
}

export { DataBaseCampaignService };
