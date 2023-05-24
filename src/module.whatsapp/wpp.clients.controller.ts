import {
  Controller,
  Post,
  Body,
  Param,
  UseGuards,
  Get,
  Delete,
  ForbiddenException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { TextMessageDataDTO } from './dto/messages.body/textMessage.data.dto';
import { ApiTags } from '@nestjs/swagger';
import { OkReponseSendMessage } from './dto/sendMessage.response.dto';
import { ClientRoleGuard } from './authentication/client.guard';
import { Authorized } from './authentication/roles.decorator';
import { UserRolesGuard } from './authentication/user.guard';
import { Role } from './database/models/user.entity';
import { ClientDTO } from './dto/client.dto';
import { WppClientsService } from './wppClientUtils/clients.service.old';
// import { ButtonsMessageDataDTO } from './dto/messages.body/buttonsMessage.body.dto';

@ApiTags('Whatsapp Clients')
@UseGuards(ClientRoleGuard, UserRolesGuard)
@Controller('wpp-client')
class WppClientsController {
  constructor(private wppClientsService: WppClientsService) {}
  @Get()
  @Authorized(Role.ADMIN)
  async getAll(): Promise<any> {
    return this.wppClientsService.clientsList;
  }

  @Post('create')
  @Authorized(Role.ADMIN)
  async createClient(@Body() body: ClientDTO) {
    console.log('body:', body);
    return await this.wppClientsService.add(body);
  }

  @Delete(':wppClientId/delete')
  @Authorized()
  async deleteClient(@Param() params: { wppClientId: string }) {
    console.log('params:', params);
    try {
      return this.wppClientsService.drop(params.wppClientId);
    } catch (error) {
      console.error(error);
      throw new ForbiddenException('Error on delete bot');
    }
  }

  @Get(':wppClientId/qr')
  @Authorized()
  async getQr(@Param() params: { wppClientId: string }) {
    console.log('params:', params);
    const clientQr = this.wppClientsService.getClientQr(params.wppClientId);
    if (typeof clientQr === 'string') {
      return clientQr;
    }
    throw new ForbiddenException('The client has no QR to read');
  }

  @Post(':wppClientId/send-text')
  @Authorized()
  async sendTextMessage(
    @Body() body: TextMessageDataDTO,
    @Param() params: { wppClientId: string }
  ) {
    console.log('body:', body);
    console.log('params:', params);
    let msgResponse: any;
    try {
      msgResponse = await this.wppClientsService.sendTextFromClient(
        params.wppClientId,
        body.to.split('+')[1] + '@c.us',
        body.text
      );
    } catch (error) {
      console.error(error);
      throw new ForbiddenException('Error on send Message');
    }
    if (!msgResponse) {
      throw new HttpException('Client is not ready', HttpStatus.SERVICE_UNAVAILABLE);
    }
    return new OkReponseSendMessage("Added to 'SendMessagesQueue'");
  }

  // @Post(':wppClientId/send-buttons')
  // @Authorized()
  // async sendButtonsMessage(
  //   @Body() body: ButtonsMessageDataDTO,
  //   @Param() params: { wppClientId: string }
  // ) {
  //   console.log('body:', body);
  //   console.log('params:', params);
  //   let msgResponse: any;
  //   try {
  //     msgResponse = await this.wppClientsService.sendButtonsFromClient(
  //       params.wppClientId,
  //       body.to.split('+')[1] + '@c.us',
  //       body.title,
  //       body.subtitle,
  //       body.buttons
  //     );
  //   } catch (error) {
  //     console.error(error);
  //     throw new ForbiddenException('Error on send Message');
  //   }
  //   if (!msgResponse) {
  //     throw new HttpException('Client is not ready', HttpStatus.SERVICE_UNAVAILABLE);
  //   }
  //   return new OkReponseSendMessage("Added to 'SendMessagesQueue'");
  // }
}

export { WppClientsController };
