import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { User } from '../../users/entities/user.entity';

export interface FastifyRequestWithUser extends FastifyRequest {
  user: User; // required if you always set it
}

export const GetUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): User => {
    const request = ctx.switchToHttp().getRequest<FastifyRequestWithUser>();
    if (!request.user) {
      throw new Error('User not found on request');
    }
    return request.user;
  },
);
