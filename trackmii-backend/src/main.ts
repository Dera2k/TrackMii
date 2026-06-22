import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

import { GlobalValidationPipe } from './common/pipes/validation.pipe';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);


    //cors
    app.enableCors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://trackmii.vercel.app',
  ],
  credentials: true,
});
    //global prefix
    app.setGlobalPrefix('api/v1');

    //validation
    app.useGlobalPipes(GlobalValidationPipe);

    //error handling
    app.useGlobalFilters(new HttpExceptionFilter());

    //response shaping
    app.useGlobalInterceptors(new TransformInterceptor());

    // swagger
    const config = new DocumentBuilder()
    .setTitle('Trackmii API')
    .setDescription("Expense tracking system API")
    .setVersion('1.0')
    .addBearerAuth()
    .build()

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);

    const port = process.env.PORT || 3000;
    await app.listen(port);
}

bootstrap();