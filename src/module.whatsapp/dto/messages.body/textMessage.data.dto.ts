import { IsString, IsNotEmpty } from 'class-validator';

class TextMessageDataDTO {
  /**
   * Message text
   */
  @IsString()
  @IsNotEmpty()
  readonly text: string;
}

export { TextMessageDataDTO };
