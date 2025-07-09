import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class CommentService {
  constructor(private prisma: PrismaService) {}

  async create(userId: number, dto: CreateCommentDto) {
  let recipientId: number | null = null;

  if (dto.parentCommentId) {
    const parent = await this.prisma.comment.findUnique({
      where: { id: dto.parentCommentId },
    });

    if (!parent) {
      throw new NotFoundException('Parent comment not found');
    }

    // Only notify if user is replying to someone else
    if (parent.userId !== userId) {
      recipientId = parent.userId;
    }
  }

  // Create the comment first
  const comment = await this.prisma.comment.create({
    data: {
      content: dto.content,
      userId,
      parentCommentId: dto.parentCommentId || null,
    },
  });

  // Create the notification if it's a reply to another user's comment
  if (recipientId) {
    await this.prisma.notification.create({
      data: {
        recipientId,
        commentId: comment.id,
      },
    });

    console.log(`🔔 Notification created for userId: ${recipientId}`);
  }

  return comment;
}


async getAll() {
  console.log("yes");
  const allComments = await this.prisma.comment.findMany({
    include: {
      user: {
        select: { id: true, name: true, email: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
  
  const tree = this.buildCommentTreeWithContext(allComments, allComments);
  
  return tree;
}

  private buildCommentTreeWithContext(allComments: any[], visibleRoots: any[]) {
    const commentMap = new Map<number, any>();

    allComments.forEach(comment => {
      commentMap.set(comment.id, { ...comment, replies: [] });
    });


    commentMap.forEach(comment => {
      if (comment.parentCommentId) {
        const parent = commentMap.get(comment.parentCommentId);
        if (parent) {
          parent.replies.push(comment);
        }
      }
    });


    const visibleRootIds = new Set(visibleRoots.map(c => c.id));
    const roots: any[] = [];

    commentMap.forEach(comment => {
      if (!comment.parentCommentId && visibleRootIds.has(comment.id)) {
        roots.push(comment);
      }
    });

    return roots;
  }


  private countReplies(comment: any): number {
    if (!comment.replies || comment.replies.length === 0) return 0;
    return comment.replies.length + comment.replies.reduce((sum: number, reply: any) => sum + this.countReplies(reply), 0);
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

  async getPaginated(page: number, limit: number) {
    const skip = (page - 1) * limit;
    const allComments = await this.prisma.comment.findMany({
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' }, 
    });

    const rootComments = allComments.filter(c => c.parentCommentId === null);
    const paginatedRoots = rootComments.slice(skip, skip + limit);

    const tree = this.buildCommentTreeWithContext(allComments, paginatedRoots);

    const totalPages = Math.ceil(rootComments.length / limit);

    return {
      comments: tree,
      total: rootComments.length,
      page,
      totalPages,
    };
  }



}
