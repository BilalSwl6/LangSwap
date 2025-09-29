import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { ChatMessage } from '../../chat-message/entities/chat-message.entity';

@Entity('practice_sessions')
export class PracticeSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  user1Id: string;

  @Column()
  user2Id: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  startedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  endedAt: Date;

  @Column({ default: 0 })
  durationSeconds: number;

  @Column({ default: 'active' })
  status: string; // active, ended, disconnected

  @Column({ nullable: true })
  endReason: string; // user_left, connection_error, completed

  @Column({ type: 'json', nullable: true })
  metadata: any; // Store additional session data

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user1Id' })
  user1: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user2Id' })
  user2: User;

  @OneToMany(() => ChatMessage, (message) => message.session)
  messages: ChatMessage[];
}
