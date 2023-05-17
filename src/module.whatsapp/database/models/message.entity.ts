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
class Message {
  @PrimaryGeneratedColumn({ primaryKeyConstraintName: 'PRIMARY' })
  msgId: string;

  @ManyToOne((type) => Bot)
  @JoinColumn({ name: 'botId' })
  botId: string;

  @Column({ length: 45 })
  to: string;

  @Column({ length: 45 })
  from: string;

  @Column({ type: 'text' })
  body: string;

  @CreateDateColumn()
  createAt: Date;

  @UpdateDateColumn()
  updateAt: Date;
}

export { Message };
