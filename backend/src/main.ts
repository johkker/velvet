import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { TransformResponseInterceptor } from './common/interceptors/transform-response.interceptor';
import * as fs from 'fs';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for frontend
  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
  });

  app.setGlobalPrefix('api/v1');

  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new TransformResponseInterceptor());

  // Swagger/OpenAPI configuration
  const config = new DocumentBuilder()
    .setTitle('Velvet API')
    .setDescription('Exclusive platform for connecting talents with clients. Complete API documentation for the Velvet platform.')
    .setVersion('1.0')
    .setContact(
      'Velvet Team',
      'https://velvet.app',
      'api@velvet.app'
    )
    .addTag('Authentication', 'User authentication and authorization endpoints')
    .addTag('Talents', 'Talent profile management and discovery')
    .addTag('Users', 'User account management')
    .addTag('Establishments', 'Establishment profile management')
    .addTag('Invitations', 'Invitation system for talents and establishments')
    .addTag('Media', 'Photo and media upload management')
    .addTag('Boosts', 'Talent profile boost and promotion system')
    .addTag('Payments', 'Payment processing and transaction management')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addServer('http://localhost:4000', 'Local Development')
    .addServer('https://api.velvet.app', 'Production')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
    customSiteTitle: 'Velvet API Documentation',
  });
  fs.writeFileSync('./swagger.json', JSON.stringify(document));

  await app.listen(process.env.PORT ?? 3000);

  console.log(`🚀 Application is running on: http://localhost:${process.env.PORT ?? 3000}`);
  console.log(`📚 Swagger documentation: http://localhost:${process.env.PORT ?? 3000}/api/docs`);
}
bootstrap();
