import { IsString, IsArray, IsNotEmpty, ValidateNested } from 'class-validator';
import { BaseMessageDTO } from './baseMessage.body.dto';
import { Type } from 'class-transformer';

class DisplayText {
  /**
   * Text to show in button
   */
  @IsString()
  @IsNotEmpty()
  readonly displayText: string;
}

class Buttom {
  /**
   * ButtonId
   */
  @IsString()
  @IsNotEmpty()
  readonly buttonId: string;

  @ValidateNested()
  @Type(() => DisplayText)
  readonly buttonText: DisplayText;
}

class ButtonsMessageDataDTO extends BaseMessageDTO {
  /**
   * Array de botões a serem enviados
   */
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Buttom)
  readonly buttons: Buttom[];

  /**
   * Buttons message title
   */
  @IsString()
  @IsNotEmpty()
  readonly title: string;

  /**
   * Buttons message title
   */
  @IsString()
  @IsNotEmpty()
  readonly subtitle: string;
}

export { ButtonsMessageDataDTO };
