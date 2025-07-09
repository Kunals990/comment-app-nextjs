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

private buildCommentTreeWithContext(allComments: any[], visibleComments: any[]) {
  const allMap = new Map<number, any>();
  const visibleMap = new Map<number, any>();
  const roots: any[] = [];

  // Build map of all comments (for reference)
  allComments.forEach(comment => {
    allMap.set(comment.id, comment);
  });

  // Initialize visible comments with empty replies - CREATE NEW OBJECTS
  visibleComments.forEach(comment => {
    const commentCopy = { ...comment, replies: [] };
    visibleMap.set(comment.id, commentCopy);
  });

  // Build tree structure
  visibleComments.forEach(comment => {
    const commentInMap = visibleMap.get(comment.id);
    
    if (comment.parentCommentId) {
      // Check if parent exists in visible comments
      const visibleParent = visibleMap.get(comment.parentCommentId);
      if (visibleParent) {
        visibleParent.replies.push(commentInMap);
      } else {
        // Check if parent exists in all comments (might be deleted)
        const deletedParent = allMap.get(comment.parentCommentId);
        if (deletedParent && deletedParent.isDeleted) {
          console.log(`⚠️ Parent ${comment.parentCommentId} is deleted, promoting reply ${comment.id} to root`);
        } else {
          console.warn(`❌ Parent ${comment.parentCommentId} not found for comment ${comment.id}`);
        }
        // Treat as root comment
        roots.push(commentInMap);
      }
    } else {
      roots.push(commentInMap);
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

  // comment.service.ts

async getPaginated(page: number, limit: number) {
  const skip = (page - 1) * limit;

  const [comments, total] = await Promise.all([
    this.prisma.comment.findMany({
      where: { parentCommentId: null, isDeleted: false },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, email: true } },
        replies: {
          where: { isDeleted: false },
          include: {
            user: { select: { id: true, name: true, email: true } },
            replies: {
              where: { isDeleted: false },
              include: {
                user: { select: { id: true, name: true, email: true } },
                replies: true, 
              },
            },
          },
        },
      },
    }),
    this.prisma.comment.count({
      where: { parentCommentId: null, isDeleted: false },
    }),
  ]);

  return {
    comments,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}


}
