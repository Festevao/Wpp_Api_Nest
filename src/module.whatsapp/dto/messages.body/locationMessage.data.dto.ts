import { IsString, IsLatitude, IsLongitude, IsOptional } from 'class-validator';
import { BaseMessageDTO } from './baseMessage.body.dto';

class LocationMessageDataDTO extends BaseMessageDTO {
  /**
   * Location latitude
   */
  @IsLatitude()
  readonly latitude: number;

  /**
   * Location longitude
   */
  @IsLongitude()
  readonly longitude: number;

  /**
   * Location description
   */
  @IsOptional()
  @IsString()
  readonly description?: string;
}

export { LocationMessageDataDTO };
