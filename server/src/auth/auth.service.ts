// server/src/auth/auth.service.ts

import { Injectable, UnauthorizedException, BadRequestException, Res } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service'; // we'll create this
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Response } from 'express';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  // Register user
  async register(dto: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new BadRequestException('Email is already registered');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        name: dto.name,
        password: hashedPassword,
      },
    });

    return { message: 'User registered successfully', userId: user.id };
  }

  // Login user
  async login(dto: LoginDto,@Res({ passthrough: true })res:Response) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user || !(await bcrypt.compare(dto.password, user.password))) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const payload = { sub: user.id, email: user.email };
    const token = await this.jwtService.signAsync(payload);

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // only https in production
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return { message: 'Login successful' };
  }

  async getUserById(userId: number) {
    const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        },
    });

    return user;
    }
}
