import { Entity, Column, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Message } from './message.entity';

@Entity()
class MessageMedia {
  @PrimaryGeneratedColumn({ primaryKeyConstraintName: 'PRIMARY' })
  mediaId: string;

  @OneToOne(() => Message)
  @JoinColumn({ name: 'msgId' })
  msgId: Message;

  @Column({ length: 45 })
  mimetype: string;

  @Column({ type: 'blob' })
  blob: string;
}

export { MessageMedia };
