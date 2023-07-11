import {
  IsNotEmpty,
  IsString,
  IsDate,
  IsNumber,
  IsPositive,
  ValidateNested,
} from 'class-validator';
import { IsValidPhone } from '../validators/phoneNumber.validator';
import { Transform, Type } from 'class-transformer';

enum CampaignStepType {
  txt = 'txt',
  media = 'media',
  waitForInteraction = 'waitForInteraction',
  waitForTimeOut = 'waitForTimeOut',
}

class CampaingStep {
  type: CampaignStepType;
  body?: string;
  caption?: string;
  interactionWords?: string[];
  timeOut?: number;
}

class CampaignDTO {
  @IsString()
  @IsNotEmpty()
  campaignName: string;

  @IsDate()
  @Transform(({ value }) => new Date(value))
  endDate: Date;

  @IsDate()
  @Transform(({ value }) => new Date(value))
  startDate: Date;

  @IsNumber()
  @IsPositive()
  messageInterval: number;

  @IsNumber()
  @IsPositive()
  chatsPerBlock: number;

  @IsNumber()
  @IsPositive()
  blockInterval: number;

  @ValidateNested({ each: true })
  @Type(() => CampaingStep)
  campaingSteps: CampaingStep[];

  @IsValidPhone({ each: true })
  numbersToSend: string[];
}

export { CampaignDTO };
