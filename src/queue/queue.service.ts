import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ChatMessage } from 'src/chat-message/entities/chat-message.entity';
import { PracticeSession } from 'src/practice-session/entities/practice-session.entity';
import { Repository } from 'typeorm';

interface AddChatMessagePayload {
  sessionId: string;
  senderId: string;
  message: string;
  messageType: 'text' | 'image' | 'file';
}

interface EndSessionPayload {
  sessionId: string;
  endReason: string;
  durationSeconds: number;
}

@Injectable()
export class QueueService {
  constructor(
    @InjectRepository(ChatMessage)
    private chatMessageRepository: Repository<ChatMessage>,
    @InjectRepository(PracticeSession)
    private sessionRepository: Repository<PracticeSession>,
  ) {}

  async addChatMessage(payload: AddChatMessagePayload): Promise<void> {
    const chatMessage = this.chatMessageRepository.create(payload);
    await this.chatMessageRepository.save(chatMessage);
  }

  async endSession(payload: EndSessionPayload): Promise<void> {
    await this.sessionRepository.update(payload.sessionId, {
      status: 'ended',
      endReason: payload.endReason,
      durationSeconds: payload.durationSeconds,
    });
    return;
  }
}
