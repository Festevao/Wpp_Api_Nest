import { IsString, IsNotEmpty } from 'class-validator';
import { BaseMessageDTO } from './baseMessage.body.dto';

class TextMessageDTO extends BaseMessageDTO {
  /**
   * TextMessage data
   */
  @IsString()
  @IsNotEmpty()
  readonly text: string;
}

export { TextMessageDTO };
