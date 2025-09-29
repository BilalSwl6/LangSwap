import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PracticeSessionService } from './practice-session.service';
import { PracticeSessionController } from './practice-session.controller';
import { PracticeSession } from './entities/practice-session.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PracticeSession])],
  controllers: [PracticeSessionController],
  providers: [PracticeSessionService],
  exports: [PracticeSessionService],
})
export class PracticeSessionModule {}
