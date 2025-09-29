import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import { PracticeSessionService } from './practice-session.service';
import { CreatePracticeSessionDto } from './dto/create-practice-session.dto';
import { UpdatePracticeSessionDto } from './dto/update-practice-session.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { ReqPayload } from 'src/auth/interfaces/req-payload.interface';

@Controller('practice-sessions')
@UseGuards(JwtAuthGuard)
export class PracticeSessionController {
  constructor(
    private readonly practiceSessionService: PracticeSessionService,
  ) {}

  @Post()
  create(@Body() createPracticeSessionDto: CreatePracticeSessionDto) {
    return this.practiceSessionService.create(createPracticeSessionDto);
  }

  @Get('my-sessions')
  findMySessions(
    @Request() req: ReqPayload,
    @Query('page', ParseIntPipe) page: number = 1,
    @Query('limit', ParseIntPipe) limit: number = 10,
  ) {
    return this.practiceSessionService.findByUserId(req.user.sub, page, limit);
  }

  @Get('my-stats')
  getMyStats(@Request() req: ReqPayload) {
    return this.practiceSessionService.getSessionStats(req.user.sub);
  }

  // Admin routes
  @Get()
  findAll(
    @Query('page', ParseIntPipe) page: number = 1,
    @Query('limit', ParseIntPipe) limit: number = 10,
  ) {
    return this.practiceSessionService.findAll(page, limit);
  }

  @Get('stats')
  getStats() {
    return this.practiceSessionService.getSessionStats();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.practiceSessionService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePracticeSessionDto: UpdatePracticeSessionDto,
  ) {
    return this.practiceSessionService.update(id, updatePracticeSessionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.practiceSessionService.remove(id);
  }
}
