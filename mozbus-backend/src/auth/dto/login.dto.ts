import { IsString, IsNotEmpty, IsOptional, IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'ceo@mozbus.mz', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ example: 'ceo_username', required: false })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiProperty({ example: 'ceo@mozbus.mz', required: false })
  @IsOptional()
  @IsString()
  identifier?: string;

  @ApiProperty({ example: 'mozbus123' })
  @IsString()
  @IsNotEmpty()
  password: string;
}
