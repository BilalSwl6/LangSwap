import { IsEmail, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @IsEmail()
  @ApiProperty({ example: 'a@a.a', description: 'Email of the user' })
  email: string;

  @IsString()
  @ApiProperty({ example: '1234567890', description: 'Password of the user' })
  password: string;
}
