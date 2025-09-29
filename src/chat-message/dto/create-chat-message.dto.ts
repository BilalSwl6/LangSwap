import { IsString, IsOptional } from 'class-validator';

export class CreateChatMessageDto {
  @IsString()
  sessionId: string;

  @IsString()
  message: string;

  @IsOptional()
  @IsString()
  messageType?: string;
}
