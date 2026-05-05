import { ValidationPipe } from '@nestjs/common';
export const GlobalValidationPipe = new ValidationPipe({
  whitelist: true,                //strip unknown properties
  forbidNonWhitelisted: true,     //throw on unknown properties
  transform: true,                //auto-transform types (string → number for @Type)
  transformOptions: {
    enableImplicitConversion: false, //explicit only, avoid surprises
  },
  stopAtFirstError: false,        //return all validation errors at once
});