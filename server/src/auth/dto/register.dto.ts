import { IsEmail, IsNotEmpty, IsOptional, MinLength } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email!: string;

  @MinLength(6)
  @IsNotEmpty()
  password!: string;

  @IsOptional()
  name?: string;
}