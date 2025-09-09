import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { join } from 'path';
import { UsersModule } from './users/users.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory(configService: ConfigService) {
        return {
          type: 'sqlite',
          database: configService.get('DB_PATH'),
          entities: [join(__dirname, '**/*.entity.{js,ts}')],
          synchronize: true, // disable/false is production
        };
      },
    }),
    AuthModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
