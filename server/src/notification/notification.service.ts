import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationService {
    constructor(private prisma: PrismaService) {}
    async getNotifications(userId: number) {
    return this.prisma.notification.findMany({
        where: { recipientId: userId },
        orderBy: { createdAt: 'desc' },
        include: {
        comment: {
            include: { user: true },
        },
        },
    });
    }

    async markAsRead(userId: number, id: number) {
    const notification = await this.prisma.notification.findUnique({ where: { id } });

    if (!notification || notification.recipientId !== userId) {
        throw new ForbiddenException('Not allowed');
    }

    return this.prisma.notification.update({
        where: { id },
        data: { isRead: true },
    });
    }
}
