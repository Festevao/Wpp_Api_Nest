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

@Entity()
class TxtMessage {
  @PrimaryGeneratedColumn({ primaryKeyConstraintName: 'PRIMARY' })
  txtMsgId: number;

  @ManyToOne((type) => Bot)
  @JoinColumn({ name: 'botId' })
  botId: string;

  @Column({ length: 45 })
  to: string;

  @Column({ type: 'text' })
  data: string;

  @CreateDateColumn()
  createAt: Date;

  @UpdateDateColumn()
  updateAt: Date;
}

export { TxtMessage };
