import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import fastifyCookie from '@fastify/cookie';
import fastifyCors from '@fastify/cors';
import type { FastifyInstance } from 'fastify';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: true }),
  );

  const fastify = app
    .getHttpAdapter()
    .getInstance() as unknown as FastifyInstance;

  // Register cookie parser
  await fastify.register(fastifyCookie, {
    secret: process.env.COOKIE_SECRET,
  });

  await fastify.register(fastifyCors, {
    origin: true,
    credentials: true, // allow cookies/auth headers
  });

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('API Docs')
    .setDescription('Interactive documentation for your API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');
  console.log(`\n\nServer listening on port ${port}`);
}
// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap();
