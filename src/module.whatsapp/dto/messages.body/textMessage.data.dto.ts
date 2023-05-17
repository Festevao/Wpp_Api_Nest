import { IsString, IsNotEmpty } from 'class-validator';
import { BaseMessageDTO } from './baseMessage.body.dto';

class TextMessageDataDTO extends BaseMessageDTO {
  /**
   * Message text
   */
  @IsString()
  @IsNotEmpty()
  readonly text: string;
}

export { TextMessageDataDTO };
