import {
  Controller,
  Post,
  Body,
  UseGuards,
  ClassSerializerInterceptor,
  UseInterceptors,
  Res,
  Get,
  Query,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenGuard } from './guards/refresh-token.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { GetUser } from './decorators/get-user.decorator';
import { User } from 'src/users/entities/user.entity';
import type { FastifyReply } from 'fastify';
import { MailsService } from 'src/mails/mails.service';

@Controller('auth')
@UseInterceptors(ClassSerializerInterceptor)
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly mailService: MailsService,
  ) {}

  @Post('register')
  async register(
    @Body() createUserDto: CreateUserDto,
    @Res({ passthrough: true }) res: FastifyReply,
  ) {
    const { user, accessToken, refreshToken } =
      await this.authService.register(createUserDto);
    await this.mailService.sendUserConfirmation(user.email);
    this.setRefreshCookie(res, refreshToken);
    return { user, accessToken };
  }

  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: FastifyReply,
  ) {
    const { user, accessToken, refreshToken } =
      await this.authService.login(loginDto);
    this.setRefreshCookie(res, refreshToken);
    return { user, accessToken };
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(
    @GetUser() user: User,
    @Res({ passthrough: true }) res: FastifyReply,
  ) {
    await this.authService.logout(user.id);
    res.clearCookie('refresh', { path: '/' });
    return { success: true };
  }

  @UseGuards(RefreshTokenGuard)
  @Post('refresh')
  async refreshTokens(
    @GetUser() user: { sub: string; refreshToken: string },
    @Res({ passthrough: true }) res: FastifyReply,
  ) {
    const tokens = await this.authService.refreshTokens(
      user.sub,
      user.refreshToken,
    );
    this.setRefreshCookie(res, tokens.refreshToken);
    return { accessToken: tokens.accessToken };
  }

  @Get('is-valid')
  @UseGuards(JwtAuthGuard)
  isValid() {
    return { success: true };
  }

  @Post('forget')
  async forgetPassword(@Body('email') email: string) {
    await this.mailService.sendForgetPasswordEmail(email);
    return { success: true, message: 'Email sent' };
  }

  @Get('forget')
  async validateForgetPasswordToken(@Query('token') token: string) {
    await this.mailService.consumePasswordResetToken(token);
    return { success: true, message: 'Token is valid' };
  }

  @Get('confirm')
  async userEmailConfirmation(@Query('token') token: string) {
    await this.mailService.consumeEmailConfirmationToken(token);
    return {
      success: true,
      message: 'Email Verified',
    };
  }

  @Post('confirm-again')
  async confirmAgain(@Body('email') email: string) {
    await this.mailService.sendUserConfirmation(email);
    return {
      success: true,
      message: 'Confirmation email sent again',
      data: { email },
    };
  }

  private setRefreshCookie(res: FastifyReply, token: string) {
    res.setCookie('refresh', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'none',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000, // in ms (7 days) - later fatch from .env
    });
  }
}
