import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { QueueService } from './queue.service';
import { ChatProcessor } from './processors/chat.processor';
import { SessionProcessor } from './processors/session.processor';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatMessage } from 'src/chat-message/entities/chat-message.entity';
import { PracticeSession } from 'src/practice-session/entities/practice-session.entity';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'chat-messages',
    }),
    BullModule.registerQueue({
      name: 'practice-sessions',
    }),
    TypeOrmModule.forFeature([ChatMessage, PracticeSession]),
  ],
  providers: [QueueService, ChatProcessor, SessionProcessor],
  exports: [QueueService],
})
export class QueueModule {}
