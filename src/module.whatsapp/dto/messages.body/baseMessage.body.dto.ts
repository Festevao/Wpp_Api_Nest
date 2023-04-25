import { IsValidPhone } from '../../validators/phoneNumber.validator';
import { TextMessageDataDTO } from './textMessage.data.dto';
import { LocationMessageDataDTO } from './locationMessage.data.dto';
import { IsDefined, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

class BaseMessageDTO {
  /**
   * Receiver number
   */
  @IsValidPhone()
  readonly to: string;

  /**
   * Message data
   */
  @ApiProperty({
    oneOf: [
      { example: TextMessageDataDTO, type: 'TextMessageDataDTO' },
      { example: LocationMessageDataDTO, type: 'LocationMessageDataDTO' },
    ],
  })
  @IsDefined({ message: 'data must be a valid messageData' })
  @ValidateNested({ message: 'data must be a valid messageData' })
  @Type(({ object, property }) => {
    const data = object[property];
    if (data.text) {
      return TextMessageDataDTO;
    }
    if (data.latitude && data.longitude) {
      return LocationMessageDataDTO;
    }
    return String;
  })
  readonly data: TextMessageDataDTO | LocationMessageDataDTO;
}

export { BaseMessageDTO };
