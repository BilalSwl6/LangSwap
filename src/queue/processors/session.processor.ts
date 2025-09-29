import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Job } from 'bullmq';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PracticeSession } from '../../practice-session/entities/practice-session.entity';

interface EndSessionJobData {
  sessionId: string;
  endReason: string;
  durationSeconds: number;
}

@Processor('practice-sessions')
@Injectable()
export class SessionProcessor extends WorkerHost {
  constructor(
    @InjectRepository(PracticeSession)
    private sessionRepository: Repository<PracticeSession>,
  ) {
    super();
  }

  async process(job: Job<EndSessionJobData>) {
    switch (job.name) {
      case 'update-session':
        return this.updateSession(job.data);
      case 'end-session':
        return this.endSession(job.data);
      default:
        throw new Error(`Unknown job type: ${job.name}`);
    }
  }

  private async updateSession(
    data: Partial<PracticeSession> & { sessionId: string },
  ) {
    const { sessionId, ...updateData } = data;
    return this.sessionRepository.update(sessionId, updateData);
  }

  private async endSession(data: EndSessionJobData) {
    const { sessionId, endReason, durationSeconds } = data;
    return this.sessionRepository.update(sessionId, {
      status: 'ended',
      endReason,
      durationSeconds,
      endedAt: new Date(),
    });
  }
}
