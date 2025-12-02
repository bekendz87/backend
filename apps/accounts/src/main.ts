import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { AccountsModule } from './app.module';
import { Logger } from '@nestjs/common';

const logger = new Logger();

async function bootstrap() {
  logger.log(`PORT ENV:${process.env.NODE_ENV}`)
  const app = await NestFactory.createMicroservice(AccountsModule, {
    transport: Transport.TCP,
    options: {
      host: '127.0.0.1',
      port: Number(process.env.PORT_ACCOUNTS),
    },
  });


  app.listen().then(() => logger.log('Microservice == Accounts == is listening'));

}
bootstrap();
