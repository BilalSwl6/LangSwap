import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateMatchingSessionDto } from './dto/create-matching-session.dto';
import { UpdateMatchingSessionDto } from './dto/update-matching-session.dto';
import { MatchingSession } from './entities/matching-session.entity';

@Injectable()
export class MatchingSessionService {
  constructor(
    @InjectRepository(MatchingSession)
    private matchingRepository: Repository<MatchingSession>,
  ) {}

  async create(
    userId: string,
    socketId: string,
    createMatchingSessionDto: CreateMatchingSessionDto,
  ) {
    const session = this.matchingRepository.create({
      userId,
      socketId,
      ...createMatchingSessionDto,
    });

    return this.matchingRepository.save(session);
  }

  async findAll(page: number = 1, limit: number = 20) {
    const [sessions, total] = await this.matchingRepository.findAndCount({
      relations: ['user', 'matchedWithUser'],
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
    const session = await this.matchingRepository.findOne({
      where: { id },
      relations: ['user', 'matchedWithUser'],
    });

    if (!session) {
      throw new NotFoundException('Matching session not found');
    }

    return session;
  }

  async findByUserId(userId: string) {
    return this.matchingRepository.find({
      where: { userId },
      relations: ['user', 'matchedWithUser'],
      order: { createdAt: 'DESC' },
    });
  }

  async findActiveByUserId(userId: string) {
    return this.matchingRepository.findOne({
      where: { userId, status: 'searching' },
      relations: ['user'],
    });
  }

  async update(id: string, updateMatchingSessionDto: UpdateMatchingSessionDto) {
    const session = await this.findOne(id);
    Object.assign(session, updateMatchingSessionDto);
    return this.matchingRepository.save(session);
  }

  async remove(id: string) {
    const session = await this.findOne(id);
    return this.matchingRepository.remove(session);
  }

  async getMatchingStats() {
    const totalSearching = await this.matchingRepository.count({
      where: { status: 'searching' },
    });

    const totalMatched = await this.matchingRepository.count({
      where: { status: 'matched' },
    });

    const recentSessions = await this.matchingRepository.find({
      where: { status: 'matched' },
      order: { matchedAt: 'DESC' },
      take: 10,
      relations: ['user', 'matchedWithUser'],
    });

    return {
      currentlySearching: totalSearching,
      totalMatched,
      recentMatches: recentSessions,
    };
  }
}
