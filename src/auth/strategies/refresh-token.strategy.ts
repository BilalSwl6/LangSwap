import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { FastifyRequest } from 'fastify';

export type JwtPayloadWithRefresh = JwtPayload & { refreshToken: string };

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get<string>('JWT_REFRESH_SECRET')!,
      passReqToCallback: true,
    });
  }

  validate(req: FastifyRequest, payload: JwtPayload): JwtPayloadWithRefresh {
    const rawAuthHeader = req.headers['authorization'];
    const authHeader =
      typeof rawAuthHeader === 'string' ? rawAuthHeader : undefined;

    const refreshToken = authHeader?.replace(/^Bearer\s+/i, '').trim();

    if (!refreshToken) {
      throw new UnauthorizedException('token missing');
    }

    return { ...payload, refreshToken };
  }
}
