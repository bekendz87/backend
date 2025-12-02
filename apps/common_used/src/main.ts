import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { CommonModule } from './app.module';
import { Logger } from '@nestjs/common';

const logger = new Logger();

async function bootstrap() {
  logger.log(`PORT ENV:${process.env.NODE_ENV}`)
  const app = await NestFactory.createMicroservice(CommonModule, {
    transport: Transport.TCP,
    options: {
      host: '127.0.0.1',
      port: Number(process.env.PORT_SHARED),
    },
  });


  app.listen().then(() => logger.log('Microservice == COMMON USED == is listening'));

}
bootstrap();
