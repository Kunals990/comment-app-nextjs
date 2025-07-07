import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class CommentService {
  constructor(private prisma: PrismaService) {}

  async create(userId: number, dto: CreateCommentDto) {
    // If it's a reply, verify the parent comment exists
    if (dto.parentCommentId) {
      const parent = await this.prisma.comment.findUnique({
        where: { id: dto.parentCommentId },
      });

      if (!parent) {
        throw new NotFoundException('Parent comment not found');
      }
    }

    // Create the comment
    const comment = await this.prisma.comment.create({
      data: {
        content: dto.content,
        userId,
        parentCommentId: dto.parentCommentId || null,
      },
    });

    return comment;
  }
}
