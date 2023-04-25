import { IsNotEmpty, IsOptional, IsString, MaxLength, Length } from 'class-validator';

class ClientDTO {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  userId: string | any;

  @IsOptional()
  @MaxLength(255)
  webhookUrl?: string;

  @IsOptional()
  @MaxLength(255)
  alias?: string;

  @IsOptional()
  @Length(32)
  encodeToken?: string;

  @IsOptional()
  @MaxLength(255)
  botId: string;
}

export { ClientDTO };
