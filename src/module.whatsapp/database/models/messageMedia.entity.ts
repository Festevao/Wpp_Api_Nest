import { Entity, Column, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Message } from './message.entity';

@Entity()
class MessageMedia {
  @PrimaryGeneratedColumn({ primaryKeyConstraintName: 'PRIMARY' })
  mediaId: string;

  @OneToOne((type) => Message)
  @JoinColumn({ name: 'msgId' })
  msgId: string;

  @Column({ length: 45 })
  mimetype: string;

  @Column({ type: 'blob' })
  blob: string;
}

export { MessageMedia };
