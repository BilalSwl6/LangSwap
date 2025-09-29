import {
  IsString,
  IsArray,
  IsNumber,
  IsBoolean,
  IsOptional,
  Min,
  Max,
} from 'class-validator';

export class CreateUserPreferenceDto {
  @IsString()
  nativeLanguage: string;

  @IsArray()
  @IsString({ each: true })
  practiceLanguages: string[];

  @IsOptional()
  @IsString()
  proficiencyLevel?: string;

  @IsOptional()
  @IsNumber()
  @Min(13)
  @Max(99)
  minAge?: number;

  @IsOptional()
  @IsNumber()
  @Min(13)
  @Max(99)
  maxAge?: number;

  @IsOptional()
  @IsBoolean()
  allowSameNative?: boolean;
}
