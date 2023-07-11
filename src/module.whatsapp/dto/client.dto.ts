import { IsNotEmpty, IsOptional, IsString, MaxLength, Length } from 'class-validator';

enum ClientStatus {
  INITIALIZING = 0,
  AUTHENTICATING = 1,
  AUTHENTICATION_SUCCESS = 2,
  AUTHENTICATION_FAILED = 3,
  READY = 4,
  DISCONNECTED = 5,
}

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

export { ClientDTO, ClientStatus };
