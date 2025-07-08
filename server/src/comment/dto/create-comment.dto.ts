import { IsNotEmpty, IsOptional, IsString, IsNumber } from 'class-validator';

export class CreateCommentDto {
  @IsNotEmpty({ message: 'Comment content cannot be empty' })
  content: string;

  @IsOptional()
  @IsNumber()
  parentCommentId?: number;
}
