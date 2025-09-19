/// <reference types="@fastify/cookie" />
import 'fastify';

declare module 'fastify' {
  interface FastifyRequest {
    cookies: { [key: string]: string };
  }
}
