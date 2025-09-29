import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppDataSource } from './database/data-source';
import { UserPreferenceModule } from './user-preference/user-preference.module';
import { MatchingSessionModule } from './matching-session/matching-session.module';
import { ChatMessageModule } from './chat-message/chat-message.module';
import { PracticeSessionModule } from './practice-session/practice-session.module';
import { QueueModule } from './queue/queue.module';
import { WebrtcModule } from './webrtc/webrtc.module';
import { PracticeModule } from './practice/practice.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      useFactory: () => AppDataSource.options,
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        connection: {
          url: configService.get('REDIS_URL', ''),
        },
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    UserPreferenceModule,
    MatchingSessionModule,
    ChatMessageModule,
    PracticeSessionModule,
    QueueModule,
    WebrtcModule,
    PracticeModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
