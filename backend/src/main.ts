import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import cookieParser from 'cookie-parser';
import { Request, Response, NextFunction } from 'express';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);
  
  // Middleware para loguear peticiones
  app.use((req: Request, res: Response, next: NextFunction) => {
    logger.log(`${req.method} ${req.url}`);
    next();
  });

  app.use(cookieParser());
  
  app.enableCors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      const envOrigins = process.env.APP_ORIGIN
        ? process.env.APP_ORIGIN.split(',').map(o => o.trim().replace(/\/$/, ''))
        : [];
      
      const allowedOrigins = [...envOrigins, 'http://localhost:3000', 'http://localhost:3002', 'http://localhost:3001'];
      
      const sanitizedOrigin = origin ? origin.replace(/\/$/, '') : null;
      
      if (!sanitizedOrigin || allowedOrigins.includes(sanitizedOrigin)) {
        callback(null, true);
      } else {
        logger.warn(`CORS blocked for origin: ${origin}`);
        callback(null, false);
      }
    },
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());

  const config = new DocumentBuilder()
    .setTitle('Prescription Management API')
    .setDescription('The Prescription Management API documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, documentFactory);

  const port = 3001;
  await app.listen(port);
  logger.log(`Backend running on port ${port}`);
}
bootstrap();
