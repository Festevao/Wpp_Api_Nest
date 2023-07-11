import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  PrimaryGeneratedColumn,
  ManyToOne,
} from 'typeorm';
import { Bot } from './bot.entity';

class NumbersToSend {
  number: string;
  state: number;
}

enum CampaignStepType {
  txt = 'txt',
  media = 'media',
  waitForInteraction = 'waitForInteraction',
  waitForTimeOut = 'waitForTimeOut',
}

enum CampaignStatus {
  active = 'active',
  canceled = 'canceled',
  done = 'done',
}

class CampaingStep {
  type: CampaignStepType;
  body?: string;
  caption?: string;
  interactionWords?: string[];
  timeOut?: number;
}

@Entity()
class Campaign {
  @PrimaryGeneratedColumn({ primaryKeyConstraintName: 'PRIMARY' })
  campaignId: string;

  @ManyToOne(() => Bot, { nullable: false, eager: true })
  @JoinColumn({ name: 'botId' })
  botId: Bot;

  @Column()
  campaignName: string;

  @Column()
  endDate: Date;

  @Column()
  startDate: Date;

  @Column({ type: 'enum', enum: CampaignStatus, default: CampaignStatus.active })
  status: CampaignStatus;

  @Column()
  messageInterval: number;

  @Column()
  chatsPerBlock: number;

  @Column()
  blockInterval: number;

  @Column({ nullable: true })
  lastBlockExecution: Date;

  @Column({ type: 'json' })
  campaingSteps: CampaingStep[];

  @Column({ type: 'json' })
  numbersToSend: NumbersToSend[];

  @CreateDateColumn()
  createAt: Date;

  @UpdateDateColumn()
  updateAt: Date;
}

export { Campaign, CampaignStatus };
