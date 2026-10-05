import 'reflect-metadata';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { configureApp } from './api/configure-app';
import { AppModule } from './app.module';
import { loadBffConfig } from './infrastructure/config/bff.config';

async function bootstrap(): Promise<void> {
  const config = loadBffConfig();
  const app = await NestFactory.create(AppModule);

  app.enableCors({ origin: config.corsOrigins.includes('*') ? true : config.corsOrigins });
  configureApp(app);

  await app.listen(config.port);
  new Logger('Bootstrap').log(`BFF ouvindo na porta ${config.port}; Swagger em /swagger`);
}

void bootstrap();
