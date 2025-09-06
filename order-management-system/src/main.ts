// ensure global File exists for dependencies that expect it (undici)
global.File = global.File || class {};
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('E-commerce Orders API')
    .setDescription('API para gerenciamento de pedidos')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  // global error handlers to avoid process crash
  process.on('unhandledRejection', (reason) => {
    // log and continue; in production you might want to exit
    // eslint-disable-next-line no-console
    console.error('Unhandled Rejection at:', reason);
  });
  process.on('uncaughtException', (err) => {
    // eslint-disable-next-line no-console
    console.error('Uncaught Exception:', err);
  });

  const port = process.env.PORT ? Number(process.env.PORT) : 3000;
  await app.listen(port, '0.0.0.0');
}
bootstrap();
