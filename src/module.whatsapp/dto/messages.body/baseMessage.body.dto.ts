import { IsValidPhone } from '../../validators/phoneNumber.validator';

class BaseMessageDTO {
  /**
   * Receiver number
   */
  @IsValidPhone()
  readonly to: string;
}

export { BaseMessageDTO };
