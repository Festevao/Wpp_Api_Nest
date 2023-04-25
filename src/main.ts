import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { WhatsappModule } from './module.whatsapp/wpp.module';
import { urlencoded, json } from 'express';
import { ValidationPipe } from '@nestjs/common';
import { isPort } from 'class-validator';

function parsePORT(PORT: string) {
  const tryParse = parseInt(PORT);
  if (isNaN(tryParse) || !isPort(tryParse)) return PORT;
  return tryParse;
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(WhatsappModule, {
    logger: ['log', 'error', 'warn', 'debug', 'verbose'],
  });

  const config = new DocumentBuilder()
    .setTitle('Whatsapp Clients Manager')
    .setDescription('Resgister/Config whatsapp clients to run like an api')
    .setVersion('1.0')
    .addTag('Users')
    .addTag('Whatsapp Clients')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app.useGlobalPipes(new ValidationPipe());
  app.use(json({ limit: '500mb' }));
  app.use(urlencoded({ extended: true, limit: '500mb' }));
  app.enableCors();
  const PORT = process.env.PORT ? parsePORT(process.env.PORT) : 3010;
  await app.listen(PORT);
}
bootstrap();
