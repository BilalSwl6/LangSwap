import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePracticeSessionDto } from './dto/create-practice-session.dto';
import { UpdatePracticeSessionDto } from './dto/update-practice-session.dto';
import { PracticeSession } from './entities/practice-session.entity';

@Injectable()
export class PracticeSessionService {
  constructor(
    @InjectRepository(PracticeSession)
    private sessionRepository: Repository<PracticeSession>,
  ) {}

  async create(createPracticeSessionDto: CreatePracticeSessionDto) {
    const session = this.sessionRepository.create(createPracticeSessionDto);
    return this.sessionRepository.save(session);
  }

  async findAll(page: number = 1, limit: number = 10) {
    const [sessions, total] = await this.sessionRepository.findAndCount({
      relations: ['user1', 'user2', 'messages'],
      order: { createdAt: 'DESC' },
      take: limit,
      skip: (page - 1) * limit,
    });

    return {
      sessions,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
    const session = await this.sessionRepository.findOne({
      where: { id },
      relations: ['user1', 'user2', 'messages'],
    });

    if (!session) {
      throw new NotFoundException('Practice session not found');
    }

    return session;
  }

  async findByUserId(userId: string, page: number = 1, limit: number = 10) {
    const [sessions, total] = await this.sessionRepository.findAndCount({
      where: [{ user1Id: userId }, { user2Id: userId }],
      relations: ['user1', 'user2', 'messages'],
      order: { createdAt: 'DESC' },
      take: limit,
      skip: (page - 1) * limit,
    });

    return {
      sessions,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async update(id: string, updatePracticeSessionDto: UpdatePracticeSessionDto) {
    const session = await this.findOne(id);
    Object.assign(session, updatePracticeSessionDto);
    return this.sessionRepository.save(session);
  }

  async remove(id: string) {
    const session = await this.findOne(id);
    return this.sessionRepository.remove(session);
  }

  async getSessionStats(userId?: string) {
    const baseQuery = this.sessionRepository.createQueryBuilder('session');

    if (userId) {
      baseQuery.where(
        'session.user1Id = :userId OR session.user2Id = :userId',
        { userId },
      );
    }

    const totalSessions = await baseQuery.getCount();

    const completedSessions = await baseQuery
      .andWhere('session.status = :status', { status: 'ended' })
      .getCount();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const avgDuration = await baseQuery
      .select('AVG(session.durationSeconds)', 'avgDuration')
      .getRawOne();

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const todaySessions = await baseQuery
      .andWhere('session.createdAt BETWEEN :start AND :end', {
        start: todayStart,
        end: todayEnd,
      })
      .getCount();

    return {
      totalSessions,
      completedSessions,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      avgDurationMinutes: Math.round(avgDuration?.avgDuration / 60) || 0,
      todaySessions,
    };
  }
}
