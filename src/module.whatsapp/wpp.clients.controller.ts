import { Controller, Post, Body, Param } from '@nestjs/common';
import { TextMessageDTO } from './dto/textMessage.body.dto';
import { ApiTags } from '@nestjs/swagger';
import { OkReponseSendMessage } from './dto/sendMessage.response.dto';

@ApiTags('Whatsapp Clients')
@Controller('wpp-clients')
class WppClientsController {
  @Post(':wppClientId/send-message')
  sendTextMessage(
    @Body() body: TextMessageDTO,
    @Param() params: { wppClientId: string }
  ) {
    console.log('body:', body);
    console.log('params:', params);
    return new OkReponseSendMessage("Added to 'SendMessagesQueue'");
  }
}

export { WppClientsController };
