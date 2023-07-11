import { Controller, Post, Body, Param, UseGuards, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ClientRoleGuard } from './authentication/client.guard';
import { Authorized } from './authentication/roles.decorator';
import { UserRolesGuard } from './authentication/user.guard';
import { Role } from './database/models/user.entity';
import { CampaignDTO } from './dto/campaign.dto';
import { DataBaseCampaignService } from './database/services/database.campaign.service';
// import { ButtonsMessageDataDTO } from './dto/messages.body/buttonsMessage.body.dto';

@ApiTags('Campaigns')
@UseGuards(ClientRoleGuard, UserRolesGuard)
@Controller('wpp-client')
class WppCampaignController {
  constructor(private dataBaseCampaignService: DataBaseCampaignService) {}
  @Get(':wppClientId/campaigns/get')
  @Authorized()
  async getAllCampaigns(@Param('wppClientId') wppClientId: string) {
    return await this.dataBaseCampaignService.findAllByBotId(wppClientId);
  }

  @Post(':wppClientId/campaigns/create')
  @Authorized()
  async createCampaign(
    @Body() body: CampaignDTO,
    @Param('wppClientId') wppClientId: string
  ) {
    return await this.dataBaseCampaignService.create(body, wppClientId);
  }
}

export { WppCampaignController };
