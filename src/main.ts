import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'node:path';
import { AppModule, ObserveInstrument } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    instrument: ObserveInstrument,
    cors: true,
  });

  // Serve static files from the 'public' directory
  app.useStaticAssets(join(import.meta.dirname, '..', 'public'), {
    prefix: '/public/', // optional: configure virtual path prefix
  });

  app.setGlobalPrefix('api');
  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}
await bootstrap();
