import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WebrtcGateway } from './webrtc.gateway';
import { QueueModule } from '../queue/queue.module';
import { MatchingSession } from '../matching-session/entities/matching-session.entity';
import { PracticeSession } from '../practice-session/entities/practice-session.entity';
import { UserPreference } from '../user-preference/entities/user-preference.entity';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule, // ✅ so we can inject ConfigService
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'), // ✅ use the unified secret
      }),
    }),
    TypeOrmModule.forFeature([
      MatchingSession,
      PracticeSession,
      UserPreference,
    ]),
    QueueModule,
  ],
  providers: [WebrtcGateway],
  exports: [WebrtcGateway],
})
export class WebrtcModule {}
