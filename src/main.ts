import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
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

  await app.listen(process.env.NODE_ENV === 'production' ? 3000 : 4000);
}
bootstrap();
