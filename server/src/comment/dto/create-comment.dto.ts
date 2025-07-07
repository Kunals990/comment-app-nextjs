import { IsNotEmpty, IsOptional, IsString, IsNumber } from 'class-validator';

export class CreateCommentDto {
  @IsString()
  @IsNotEmpty()
  content!: string;

  @IsOptional()
  @IsNumber()
  parentCommentId?: number;
}
