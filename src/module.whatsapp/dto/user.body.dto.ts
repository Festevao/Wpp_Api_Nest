import { IsNotEmpty, IsOptional, IsString, MaxLength, Length } from 'class-validator';

class UserDTO {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  readonly userId: string;

  @IsOptional()
  @Length(32)
  token?: string;
}

export { UserDTO };
