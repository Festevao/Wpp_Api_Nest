import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  PrimaryColumn,
  ManyToOne,
} from 'typeorm';
import { User } from './user.entity';

@Entity()
class Bot {
  @PrimaryColumn({ primaryKeyConstraintName: 'PRIMARY', length: 45 })
  botId: string;

  @ManyToOne((type) => User)
  @JoinColumn({ name: 'userId' })
  userId: string;

  @Column({ nullable: true, length: 255 })
  webhookUrl: string;

  @Column({ length: 32, unique: true })
  encodeToken: string;

  @Column({ nullable: true, length: 45 })
  alias: string;

  @CreateDateColumn()
  createAt: Date;

  @UpdateDateColumn()
  updateAt: Date;
}

export { Bot };
