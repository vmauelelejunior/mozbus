import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors(); // Habilita requisições do frontend

  // Configuração Global de Validação (10/10 standard)
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // Configuração do Swagger
  const config = new DocumentBuilder()
    .setTitle('MozBus API - Ecossistema de Transporte')
    .setDescription('API central para gestão de passageiros, transportadoras e terminais.')
    .setVersion('1.0')
    .addTag('mozbus')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 MozBus Backend rodando em: http://localhost:${port}`);
  console.log(`📖 Documentação disponível em: http://localhost:${port}/api/docs`);
}
bootstrap();
