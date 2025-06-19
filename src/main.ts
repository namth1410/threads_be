import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Queue } from 'bullmq';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 👇 Prefix tất cả route bằng /api
  app.setGlobalPrefix('/api');

  // 👇 Swagger config
  const config = new DocumentBuilder()
    .setTitle('API Example')
    .setDescription('API documentation for the NestJS application')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  // 👇 Tạo tài liệu swagger với prefix '/api'
  const document = SwaggerModule.createDocument(app, config);

  // 👇 Swagger UI hiển thị ở /docs
  SwaggerModule.setup('/docs', app, document);

  // 👇 Pipe validation
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  // 👇 Mở CORS cho tất cả origin
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  });

  // 👇 BullMQ UI (Bull Board)
  const serverAdapter = new ExpressAdapter();
  serverAdapter.setBasePath('/admin/queues');

  const uploadQueue = new Queue('upload-media', {
    connection: {
      host: process.env.REDIS_HOST || '127.0.0.1',
      port: Number(process.env.REDIS_PORT) || 6379,
    },
  });

  createBullBoard({
    queues: [new BullMQAdapter(uploadQueue)],
    serverAdapter,
  });

  // 👇 Gắn bull-board vào Nest's express instance
  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.use('/admin/queues', serverAdapter.getRouter());

  await app.listen(process.env.NODE_ENV === 'production' ? 3000 : 4000);
}
bootstrap();
