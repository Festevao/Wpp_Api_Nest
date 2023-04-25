import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryColumn,
} from 'typeorm';

enum Role {
  ADMIN = 'ADMIN',
  USER = 'USER',
  OPERATOR = 'OPERATOR',
}

@Entity()
class User {
  @PrimaryColumn({ primaryKeyConstraintName: 'PRIMARY' })
  userId: string;

  @Column({ type: 'enum', enum: Role, default: Role.USER })
  role: Role;

  @Column({ length: 32, unique: true })
  token: string;

  @CreateDateColumn()
  createAt: Date;

  @UpdateDateColumn()
  updateAt: Date;
}

export { User, Role };
