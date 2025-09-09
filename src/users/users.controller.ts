import {
  Controller,
  Get,
  UseGuards,
  ClassSerializerInterceptor,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from './entities/user.entity';

@Controller('users')
@UseGuards(JwtAuthGuard)
@UseInterceptors(ClassSerializerInterceptor)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  @Get('profile')
  getProfile(@GetUser() user: User) {
    return user;
  }

  @Get('protected')
  demo() {
    return 'This is protected route';
  }
}
