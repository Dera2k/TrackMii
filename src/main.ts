import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    //validation pip stuff
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    //global prefix
    app.setGlobalPrefix('api/v1')

    // swagger
    const config = new DocumentBuilder()
    .setTitle('Trackmii API')
    .setDescription("Expense tracking system API")
    .setVersion('1.0')
    .addBearerAuth()
    .build()


    const port = process.env.PORT || 3000;
    await app.listen(port);

  }
bootstrap();
