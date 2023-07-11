import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  PrimaryColumn,
  ManyToOne,
} from 'typeorm';
import { Bot } from './bot.entity';

@Entity()
class Contact {
  @PrimaryColumn({ primaryKeyConstraintName: 'PRIMARY', length: 45 })
  contactNumber: string;

  @ManyToOne(() => Bot, { nullable: false, eager: true })
  @JoinColumn({ name: 'botId' })
  botId: Bot;

  @Column({ nullable: true, length: 45 })
  contactName: string;

  @CreateDateColumn()
  createAt: Date;

  @UpdateDateColumn()
  updateAt: Date;
}

export { Contact };
