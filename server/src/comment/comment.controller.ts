import { Body, Controller, Post, Query, Req, UseGuards } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Request } from 'express';
import { Get } from '@nestjs/common';
import { Param, Patch, Delete} from '@nestjs/common';

interface AuthRequest extends Request {
  user: {
    userId: number;
    email: string;
  };
}

@Controller('comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Req() req: AuthRequest, @Body() dto: CreateCommentDto) {
    const userId = req.user.userId;
    return this.commentService.create(userId, dto);
  }

  @Get()
  async getComments(
    @Query('page') page?: string,
    @Query('limit') limit?: string
  ) {
    const pageNumber = parseInt(page || '', 10);
    const limitNumber = parseInt(limit || '', 10);

    const isPaginated = !isNaN(pageNumber) && !isNaN(limitNumber);

    if (isPaginated) {
      const result = await this.commentService.getPaginated(pageNumber, limitNumber);
      return {
        comments: result.comments,
        total: result.total,
        page: result.page,
        totalPages: result.totalPages,
      };
    }

    return this.commentService.getAll();
  }


  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  edit(@Req() req: AuthRequest, @Param('id') id: string, @Body() body: { content: string }) {
    return this.commentService.editComment(req.user.userId, Number(id), body.content);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  delete(@Req() req: AuthRequest, @Param('id') id: string) {
    return this.commentService.deleteComment(req.user.userId, Number(id));
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/restore')
  restore(@Req() req: AuthRequest, @Param('id') id: string) {
    return this.commentService.restoreComment(req.user.userId, Number(id));
  }

}


