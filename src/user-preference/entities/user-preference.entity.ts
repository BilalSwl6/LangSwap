// src/entities/user-preference.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity'; // Adjust path as needed

@Entity('user_preferences')
export class UserPreference {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  nativeLanguage: string;

  @Column('simple-array')
  practiceLanguages: string[];

  @Column({ default: 'beginner' })
  proficiencyLevel: string; // beginner, intermediate, advanced

  @Column({ default: 18 })
  minAge: number;

  @Column({ default: 99 })
  maxAge: number;

  @Column({ default: true })
  allowSameNative: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;
}
