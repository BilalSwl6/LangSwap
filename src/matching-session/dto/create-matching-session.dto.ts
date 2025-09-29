import { IsObject } from 'class-validator';

export class CreateMatchingSessionDto {
  @IsObject()
  preferences: any;
}
