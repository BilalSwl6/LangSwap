// src/dto/preferences.dto.ts
import {
  IsString,
  IsArray,
  IsOptional,
  IsNumber,
  IsBoolean,
  Min,
  Max,
} from 'class-validator';

export class CreatePreferencesDto {
  @IsString()
  nativeLanguage: string;

  @IsArray()
  @IsString({ each: true })
  languagesToPractice: string[];

  @IsOptional()
  @IsString()
  proficiencyLevel?: string;

  @IsOptional()
  @IsNumber()
  duolingoScore?: number;

  @IsOptional()
  @IsBoolean()
  allowSameLanguagePartners?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(13)
  @Max(100)
  minAge?: number;

  @IsOptional()
  @IsNumber()
  @Min(13)
  @Max(100)
  maxAge?: number;
}

export class UpdatePreferencesDto extends CreatePreferencesDto {}

export class StartMatchingDto {
  @IsOptional()
  @IsString()
  nativeLanguage?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  languagesToPractice?: string[];

  @IsOptional()
  @IsString()
  proficiencyLevel?: string;
}
