import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { CommentModule } from './comment/comment.module';
import { PrismaModule } from './prisma/prisma.module';
import { NotificationModule } from './notification/notification.module';

@Module({
  imports: [
    AuthModule,
    CommentModule,
    PrismaModule,
    NotificationModule,
  ],
})
export class AppModule {}