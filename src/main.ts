import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: true }),
  );

  const config = new DocumentBuilder()
    .setTitle('API Docs')
    .setDescription('Interactive documentation for your API')
    .setVersion('1.0')
    .addBearerAuth() // if you use JWT
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.listen(3001, '127.0.0.1');
  console.log('\n\nhttp://127.0.0.1:3001\n\n');
}
// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap();
