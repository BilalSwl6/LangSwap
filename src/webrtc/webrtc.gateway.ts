/* eslint-disable @typescript-eslint/require-await */
import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MatchingSession } from '../matching-session/entities/matching-session.entity';
import { PracticeSession } from '../practice-session/entities/practice-session.entity';
import { UserPreference } from '../user-preference/entities/user-preference.entity';
import { QueueService } from '../queue/queue.service';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userData?: Record<string, unknown>;
}

interface MatchingPayload {
  preferences: Partial<UserPreference>;
}

interface WebRTCOfferPayload {
  offer: RTCSessionDescriptionInit;
  to: string;
}

interface WebRTCAnswerPayload {
  answer: RTCSessionDescriptionInit;
  to: string;
}

interface ICECandidatePayload {
  candidate: RTCIceCandidateInit;
  to: string;
}

interface ChatMessagePayload {
  message: string;
  sessionId: string;
}

interface EndSessionPayload {
  sessionId: string;
  reason?: string;
}

@WebSocketGateway({
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true,
  },
  namespace: '/practice',
})
@Injectable()
export class WebrtcGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private logger = new Logger('WebrtcGateway');
  private onlineUsers = new Map<string, AuthenticatedSocket>();
  private matchingSessions = new Map<string, string>();

  constructor(
    private jwtService: JwtService,
    private queueService: QueueService,
    @InjectRepository(MatchingSession)
    private matchingRepository: Repository<MatchingSession>,
    @InjectRepository(PracticeSession)
    private sessionRepository: Repository<PracticeSession>,
    @InjectRepository(UserPreference)
    private preferenceRepository: Repository<UserPreference>,
  ) {}

  async handleConnection(client: AuthenticatedSocket) {
    const token = client.handshake.auth.token as string | undefined;
    console.log('Client connected:', client.id);
    if (!token) {
      client.disconnect();
      return;
    }

    try {
      const payload = this.jwtService.verify<{
        sub: string;
        [key: string]: unknown;
      }>(token);
      client.userId = payload.sub;
      client.userData = payload;
      this.onlineUsers.set(client.userId, client);
      this.logger.log(`User ${client.userId} connected`);
      this.server.emit('online-count', this.onlineUsers.size);
    } catch (error) {
      this.logger.error('Authentication failed:', error);
      client.disconnect();
    }
  }

  async handleDisconnect(client: AuthenticatedSocket) {
    if (!client.userId) return;
    this.onlineUsers.delete(client.userId);
    this.logger.log(`User ${client.userId} disconnected`);
    await this.handleUserDisconnect(client.userId);
    this.server.emit('online-count', this.onlineUsers.size);
  }

  @SubscribeMessage('start-matching')
  async handleStartMatching(
    @MessageBody() data: MatchingPayload,
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    if (!client.userId) return;

    const matchingSession = this.matchingRepository.create({
      userId: client.userId,
      socketId: client.id,
      preferences: data.preferences,
      status: 'searching',
    });
    await this.matchingRepository.save(matchingSession);
    this.matchingSessions.set(client.userId, matchingSession.id);

    const match = await this.findMatch(client.userId, data.preferences);
    if (match) {
      await this.createPracticeSession(
        client.userId,
        match.userId,
        client,
        match.socket,
      );
    } else {
      client.emit('matching-status', { status: 'searching' });
    }
  }

  @SubscribeMessage('stop-matching')
  async handleStopMatching(@ConnectedSocket() client: AuthenticatedSocket) {
    if (!client.userId) return;
    await this.stopMatching(client.userId);
  }

  @SubscribeMessage('webrtc-offer')
  async handleWebRTCOffer(
    @MessageBody() data: WebRTCOfferPayload,
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    const targetSocket = this.onlineUsers.get(data.to);
    if (targetSocket) {
      targetSocket.emit('webrtc-offer', {
        offer: data.offer,
        from: client.userId,
      });
    }
  }

  @SubscribeMessage('webrtc-answer')
  async handleWebRTCAnswer(
    @MessageBody() data: WebRTCAnswerPayload,
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    const targetSocket = this.onlineUsers.get(data.to);
    if (targetSocket) {
      targetSocket.emit('webrtc-answer', {
        answer: data.answer,
        from: client.userId,
      });
    }
  }

  @SubscribeMessage('webrtc-ice-candidate')
  async handleICECandidate(
    @MessageBody() data: ICECandidatePayload,
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    const targetSocket = this.onlineUsers.get(data.to);
    if (targetSocket) {
      targetSocket.emit('webrtc-ice-candidate', {
        candidate: data.candidate,
        from: client.userId,
      });
    }
  }

  @SubscribeMessage('send-message')
  async handleSendMessage(
    @MessageBody() data: ChatMessagePayload,
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    if (!client.userId) return;
    await this.queueService.addChatMessage({
      sessionId: data.sessionId,
      senderId: client.userId,
      message: data.message,
      messageType: 'text',
    });

    const session = await this.sessionRepository.findOne({
      where: { id: data.sessionId },
    });
    if (!session) return;

    const otherUserId =
      session.user1Id === client.userId ? session.user2Id : session.user1Id;
    const otherSocket = this.onlineUsers.get(otherUserId);
    if (otherSocket) {
      otherSocket.emit('receive-message', {
        message: data.message,
        from: client.userId,
        sessionId: data.sessionId,
        timestamp: new Date(),
      });
    }
  }

  @SubscribeMessage('end-session')
  async handleEndSession(
    @MessageBody() data: EndSessionPayload,
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    if (!client.userId) return;
    await this.endSession(
      data.sessionId,
      client.userId,
      data.reason ?? 'user_left',
    );
  }

  // ----------------- Private helpers -----------------

  private async findMatch(
    userId: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    preferences: Partial<UserPreference>,
  ) {
    const userPreference = await this.preferenceRepository.findOne({
      where: { userId },
    });
    if (!userPreference) return null;

    const availableSessions = await this.matchingRepository.find({
      where: { status: 'searching' },
      relations: ['user'],
    });

    for (const session of availableSessions) {
      if (session.userId === userId) continue;

      const matchPreference = await this.preferenceRepository.findOne({
        where: { userId: session.userId },
      });
      if (!matchPreference) continue;

      const socket = this.onlineUsers.get(session.userId);
      if (socket && this.isCompatibleMatch(userPreference, matchPreference)) {
        return { userId: session.userId, socket };
      }
    }

    return null;
  }

  private isCompatibleMatch(
    user1Pref: UserPreference,
    user2Pref: UserPreference,
  ): boolean {
    const user1CanPractice = user1Pref.practiceLanguages.includes(
      user2Pref.nativeLanguage,
    );
    const user2CanPractice = user2Pref.practiceLanguages.includes(
      user1Pref.nativeLanguage,
    );
    return user1CanPractice && user2CanPractice;
  }

  private async createPracticeSession(
    user1Id: string,
    user2Id: string,
    user1Socket: AuthenticatedSocket,
    user2Socket: AuthenticatedSocket,
  ) {
    const session = this.sessionRepository.create({
      user1Id,
      user2Id,
      status: 'active',
    });
    await this.sessionRepository.save(session);

    await this.matchingRepository.update(
      { userId: user1Id },
      { status: 'matched', matchedWithUserId: user2Id, matchedAt: new Date() },
    );
    await this.matchingRepository.update(
      { userId: user2Id },
      { status: 'matched', matchedWithUserId: user1Id, matchedAt: new Date() },
    );

    user1Socket.emit('match-found', {
      sessionId: session.id,
      partnerId: user2Id,
      partnerData: user2Socket.userData,
    });
    user2Socket.emit('match-found', {
      sessionId: session.id,
      partnerId: user1Id,
      partnerData: user1Socket.userData,
    });

    this.matchingSessions.delete(user1Id);
    this.matchingSessions.delete(user2Id);
  }

  private async stopMatching(userId: string) {
    const sessionId = this.matchingSessions.get(userId);
    if (sessionId) {
      await this.matchingRepository.update(sessionId, {
        status: 'disconnected',
      });
      this.matchingSessions.delete(userId);
    }
  }

  private async handleUserDisconnect(userId: string) {
    await this.stopMatching(userId);

    const activeSession = await this.sessionRepository.findOne({
      where: [
        { user1Id: userId, status: 'active' },
        { user2Id: userId, status: 'active' },
      ],
    });

    if (activeSession) {
      await this.endSession(activeSession.id, userId, 'connection_error');
    }
  }

  private async endSession(sessionId: string, userId: string, reason: string) {
    const session = await this.sessionRepository.findOne({
      where: { id: sessionId },
    });
    if (!session) return;

    const durationSeconds = Math.floor(
      (Date.now() - session.startedAt.getTime()) / 1000,
    );

    await this.queueService.endSession({
      sessionId,
      endReason: reason,
      durationSeconds,
    });

    const otherUserId =
      session.user1Id === userId ? session.user2Id : session.user1Id;
    const otherSocket = this.onlineUsers.get(otherUserId);
    if (otherSocket) {
      otherSocket.emit('session-ended', { reason, duration: durationSeconds });
    }
  }

  getOnlineUsersCount(): number {
    return this.onlineUsers.size;
  }
}
