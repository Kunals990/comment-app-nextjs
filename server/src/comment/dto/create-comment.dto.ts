import { IsNotEmpty, IsOptional, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCommentDto {
  @IsNotEmpty({ message: 'Comment content cannot be empty' })
  content: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'parentCommentId must be a number' })
  parentCommentId?: number;
}
