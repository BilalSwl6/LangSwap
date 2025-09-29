import { PartialType } from '@nestjs/mapped-types';
import { CreatePracticeSessionDto } from './create-practice-session.dto';
import { IsOptional, IsString, IsNumber } from 'class-validator';

export class UpdatePracticeSessionDto extends PartialType(
  CreatePracticeSessionDto,
) {
  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  endReason?: string;

  @IsOptional()
  @IsNumber()
  durationSeconds?: number;
}
