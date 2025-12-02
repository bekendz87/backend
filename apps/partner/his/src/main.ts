import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { HISModule } from './app.module';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

const logger = new Logger();
const config = new ConfigService()

async function bootstrap() {
  const appKeysJson = config.get<any>("APP_KEYS")
  const appKeys = JSON.parse(appKeysJson);

  logger.log(`PORT ENV:${process.env.NODE_ENV}`)

  const app = await NestFactory.createMicroservice(HISModule, {
    transport: Transport.TCP,
    options: {
      host: '127.0.0.1',
      port: Number(process.env.PORT_HIS),
    },
  });



  app.listen().then(() => logger.log('Microservice == HIS == is listening'));

}
bootstrap();
