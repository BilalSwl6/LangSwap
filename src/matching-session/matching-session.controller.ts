import {
  Controller,
  Get,
  // Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import { MatchingSessionService } from './matching-session.service';
// import { CreateMatchingSessionDto } from './dto/create-matching-session.dto';
import { UpdateMatchingSessionDto } from './dto/update-matching-session.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { ReqPayload } from 'src/auth/interfaces/req-payload.interface';

@Controller('matching-sessions')
@UseGuards(JwtAuthGuard)
export class MatchingSessionController {
  constructor(
    private readonly matchingSessionService: MatchingSessionService,
  ) {}

  @Get('my-sessions')
  findMySessions(@Request() req: ReqPayload) {
    return this.matchingSessionService.findByUserId(req.user.sub);
  }

  @Get('my-active')
  findMyActiveSession(@Request() req: ReqPayload) {
    return this.matchingSessionService.findActiveByUserId(req.user.sub);
  }

  // Admin routes
  @Get('stats')
  getMatchingStats() {
    return this.matchingSessionService.getMatchingStats();
  }

  @Get()
  findAll(
    @Query('page', ParseIntPipe) page: number = 1,
    @Query('limit', ParseIntPipe) limit: number = 20,
  ) {
    return this.matchingSessionService.findAll(page, limit);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.matchingSessionService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateMatchingSessionDto: UpdateMatchingSessionDto,
  ) {
    return this.matchingSessionService.update(id, updateMatchingSessionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.matchingSessionService.remove(id);
  }
}
