import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Job } from 'bullmq';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatMessage } from '../../chat-message/entities/chat-message.entity';

@Processor('chat-messages')
@Injectable()
export class ChatProcessor extends WorkerHost {
  constructor(
    @InjectRepository(ChatMessage)
    private chatMessageRepository: Repository<ChatMessage>,
  ) {
    super();
  }

  async process(job: Job<any>) {
    switch (job.name) {
      case 'save-message':
        return this.saveMessage(job.data);
      default:
        throw new Error(`Unknown job type: ${job.name}`);
    }
  }

  private async saveMessage(data: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const message = this.chatMessageRepository.create(data);
    return this.chatMessageRepository.save(message);
  }
}
