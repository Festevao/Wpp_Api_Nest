import {
  Controller,
  Post,
  Body,
  Param,
  UseGuards,
  Get,
  ForbiddenException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { BaseMessageDTO } from './dto/messages.body/baseMessage.body.dto';
import { ApiTags } from '@nestjs/swagger';
import { OkReponseSendMessage } from './dto/sendMessage.response.dto';
import { ClientRoleGuard } from './authentication/client.guard';
import { Authorized } from './authentication/roles.decorator';
import { UserRolesGuard } from './authentication/user.guard';
import { Role } from './database/models/user.entity';
import { ClientDTO } from './dto/client.dto';
import { WppClientsService } from './wppClientUtils/clients.service';
import { WppMessage } from './dto/intenalMessage.dto';

@ApiTags('Whatsapp Clients')
@UseGuards(ClientRoleGuard, UserRolesGuard)
@Controller('wpp-client')
class WppClientsController {
  constructor(private wppClientsService: WppClientsService) {}
  @Post('create')
  @Authorized(Role.ADMIN)
  async createClient(@Body() body: ClientDTO) {
    console.log('body:', body);
    return await this.wppClientsService.add(body);
  }

  @Get(':wppClientId/qr')
  @Authorized()
  async getQr(@Param() params: { wppClientId: string }) {
    console.log('params:', params);
    const [clientStatus, clientQr] = this.wppClientsService.getClientQr(
      params.wppClientId
    );
    if (typeof clientQr === 'string' && clientStatus === 1) {
      return `<img src="https://api.qrserver.com/v1/create-qr-code/?data=${clientQr};size=100x100" />`;
    }
    throw new ForbiddenException('The client has not QR to ready');
  }

  @Post(':wppClientId/send-message')
  @Authorized()
  async sendTextMessage(
    @Body() body: BaseMessageDTO,
    @Param() params: { wppClientId: string }
  ) {
    console.log('body:', body);
    console.log('params:', params);
    let msgResponse: boolean | WppMessage;
    try {
      msgResponse = await this.wppClientsService.sendMessageFromClient(
        params.wppClientId,
        body
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
}

export { WppClientsController };
