import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
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

  async getAll() {
  return this.prisma.comment.findMany({
      where: {
        parentCommentId: null,
        isDeleted: false,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        replies: {
          where: { isDeleted: false },
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
            replies: { // nested replies
              where: { isDeleted: false },
              include: {
                user: { select: { id: true, name: true, email: true } },
                replies: true, // you can go deeper if needed
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async editComment(userId: number, commentId: number, content: string) {
    const comment = await this.prisma.comment.findUnique({ where: { id: commentId } });

    if (!comment || comment.userId !== userId) {
      throw new ForbiddenException('Not allowed to edit this comment');
    }

    const diff = (Date.now() - new Date(comment.createdAt).getTime()) / 1000 / 60;
    if (diff > 15) {
      throw new BadRequestException('Edit window expired');
    }

    return this.prisma.comment.update({
      where: { id: commentId },
      data: { content },
    });
  }

  async deleteComment(userId: number, commentId: number) {
    const comment = await this.prisma.comment.findUnique({ where: { id: commentId } });

    if (!comment || comment.userId !== userId) {
      throw new ForbiddenException('Not allowed to delete this comment');
    }

    const diff = (Date.now() - new Date(comment.createdAt).getTime()) / 1000 / 60;
    if (diff > 15) {
      throw new BadRequestException('Delete window expired');
    }

    return this.prisma.comment.update({
      where: { id: commentId },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });
  }

  async restoreComment(userId: number, commentId: number) {
    const comment = await this.prisma.comment.findUnique({ where: { id: commentId } });

    if (!comment || comment.userId !== userId || !comment.isDeleted) {
      throw new ForbiddenException('Not allowed to restore');
    }

    const diff = (Date.now() - new Date(comment.deletedAt!).getTime()) / 1000 / 60;
    if (diff > 15) {
      throw new BadRequestException('Restore window expired');
    }

    return this.prisma.comment.update({
      where: { id: commentId },
      data: {
        isDeleted: false,
        deletedAt: null,
      },
    });
  }


}
