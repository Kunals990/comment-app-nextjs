import { Controller, Post, Body, Get, Req, UseGuards, Res, Options, HttpCode } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { Request } from 'express';
import { Response } from 'express';

interface AuthRequest extends Request {
  user: {
    userId: number;
    email: string;
  };
}

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Options('register')
  @HttpCode(200)
  preflightRegister() {
    // Empty method to handle preflight
  }

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    return this.authService.login(dto,res);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('token');
    return { message: 'Logged out successfully' };
  }

  // ✅ PROTECTED route
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@Req() req:AuthRequest) {
    const user = await this.authService.getUserById(req.user.userId);
    return user;
  }
}
