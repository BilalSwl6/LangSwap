import { IsString, IsOptional, IsObject } from 'class-validator';

export class CreatePracticeSessionDto {
  @IsString()
  user1Id: string;

  @IsString()
  user2Id: string;

  @IsOptional()
  @IsObject()
  metadata?: any;
}
