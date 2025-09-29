import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import * as dotenv from 'dotenv';

// load .env
dotenv.config();

const DB_PROVIDER = process.env.DB_PROVIDER || 'postgres';

@Index(['email', 'isUsed']) // speed up lookup of active tokens by email
@Entity({ name: 'password_reset_tokens' })
export class PasswordResetToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  email: string;

  @Index()
  @Column()
  token: string;

  @Column({ default: false, name: 'is_used' })
  isUsed: boolean;

  @Column({
    type: DB_PROVIDER === 'postgres' ? 'timestamptz' : 'datetime',
    name: 'expires_at',
  })
  expiresAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

@Index(['email', 'isUsed'])
@Entity({ name: 'email_confirmation_tokens' })
export class EmailConfirmationToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  email: string;

  @Index()
  @Column()
  token: string; // store hashed version

  @Column({ default: false, name: 'is_used' })
  isUsed: boolean;

  @Column({
    type: DB_PROVIDER === 'postgres' ? 'timestamptz' : 'datetime',
    name: 'expires_at',
  })
  expiresAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
