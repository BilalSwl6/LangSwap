import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MatchingSessionService } from './matching-session.service';
import { MatchingSessionController } from './matching-session.controller';
import { MatchingSession } from './entities/matching-session.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MatchingSession])],
  controllers: [MatchingSessionController],
  providers: [MatchingSessionService],
  exports: [MatchingSessionService],
})
export class MatchingSessionModule {}
