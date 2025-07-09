import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  );

  app.enableCors({
    origin: [
    'http://localhost:3000',  
    'http://192.168.1.4:3000',            
    'https://comments.kunalsable.com/',      
    'https://comments-99.vercel.app',   
  ],
    credentials: true,
  });

  await app.listen(5000);
}

bootstrap(); 