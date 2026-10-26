import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import { PrismaExceptionFilter } from './common/filters/prisma-exception.filter.js';

export function configureApp(app: INestApplication): void {
  const config = app.get(ConfigService);
  const proxyHops = config.get<number>('TRUST_PROXY', 0);

  if (proxyHops > 0) {
    (app as NestExpressApplication).set('trust proxy', proxyHops);
  }

  app.use(helmet());
  app.enableCors({ origin: config.getOrThrow<string>('CORS_ORIGIN') });
  app.setGlobalPrefix('api');
  app.useGlobalFilters(new PrismaExceptionFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
}
