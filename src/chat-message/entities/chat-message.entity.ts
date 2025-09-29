import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { PracticeSession } from '../../practice-session/entities/practice-session.entity';

@Entity('chat_messages')
export class ChatMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  sessionId: string;

  @Column()
  senderId: string;

  @Column('text')
  message: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  sentAt: Date;

  @Column({ default: 'text' })
  messageType: string; // text, image, file

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => PracticeSession, (session) => session.messages)
  @JoinColumn({ name: 'sessionId' })
  session: PracticeSession;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'senderId' })
  sender: User;
}
