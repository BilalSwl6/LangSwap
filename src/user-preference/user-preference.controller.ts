import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { UserPreferenceService } from './user-preference.service';
import { CreateUserPreferenceDto } from './dto/create-user-preference.dto';
import { UpdateUserPreferenceDto } from './dto/update-user-preference.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'; // Adjust path as needed
import type { ReqPayload } from 'src/auth/interfaces/req-payload.interface';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from 'src/users/entities/user.entity';

@Controller('user-preferences')
@UseGuards(JwtAuthGuard)
export class UserPreferenceController {
  constructor(private readonly userPreferenceService: UserPreferenceService) {}

  @Post()
  create(
    // @Request() req: ReqPayload,
    @Body() createUserPreferenceDto: CreateUserPreferenceDto,
    @GetUser() user: User,
  ) {
    return this.userPreferenceService.create(user.id, createUserPreferenceDto);
  }

  @Get('my-preferences')
  findMyPreferences(@Request() req: ReqPayload) {
    return this.userPreferenceService.findByUserId(req.user.sub);
  }

  @Put('my-preferences')
  update(
    @Request() req: ReqPayload,
    @Body() updateUserPreferenceDto: UpdateUserPreferenceDto,
  ) {
    return this.userPreferenceService.update(
      req.user.sub,
      updateUserPreferenceDto,
    );
  }

  @Delete('my-preferences')
  remove(@Request() req: ReqPayload) {
    return this.userPreferenceService.remove(req.user.sub);
  }

  // Admin only routes
  @Get()
  findAll() {
    return this.userPreferenceService.findAll();
  }

  @Get(':userId')
  findOne(@Param('userId') userId: string) {
    return this.userPreferenceService.findByUserId(userId);
  }
}
