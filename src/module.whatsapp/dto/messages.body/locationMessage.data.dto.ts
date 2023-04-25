import { IsString, IsLatitude, IsLongitude, IsOptional } from 'class-validator';

class LocationMessageDataDTO {
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
