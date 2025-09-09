import { Injectable } from '@nestjs/common';
import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

@Injectable()
export class CreateUserDto {
  @IsString()
  @MinLength(3)
  @ApiProperty({ example: 'John', description: 'First name of the user' })
  first_name: string;

  @IsString()
  @MinLength(3)
  @ApiProperty({ example: 'Master', description: 'Last name of the user' })
  last_name: string;

  @IsString()
  @MinLength(3)
  @IsEmail()
  @ApiProperty({ example: 'a@a.a', description: 'Email of the user' })
  email: string;

  @IsString()
  @MinLength(3)
  @ApiProperty({ example: 'johnm', description: 'Username of the user' })
  username: string;

  @IsString()
  @MinLength(8)
  @ApiProperty({ example: '1234567890', description: 'Password of the user' })
  password: string;
}
