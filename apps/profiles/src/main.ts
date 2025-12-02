import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { ProfilesModule } from './app.module';
import { Logger } from '@nestjs/common';

const logger = new Logger();

async function bootstrap() {
  logger.log(`PORT ENV:${process.env.NODE_ENV}`)
  const app = await NestFactory.createMicroservice(ProfilesModule, {
    transport: Transport.TCP,
    options: {
      host: '127.0.0.1',
      port: Number(process.env.PORT_PROFILES),
    },
  });


  app.listen().then(() => logger.log('Microservice == PROFILES == is listening'));

}
bootstrap();
