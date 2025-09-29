import { PartialType } from '@nestjs/mapped-types';
import { CreateMatchingSessionDto } from './create-matching-session.dto';

export class UpdateMatchingSessionDto extends PartialType(
  CreateMatchingSessionDto,
) {}
