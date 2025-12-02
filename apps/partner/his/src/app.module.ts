import { Module, Logger } from '@nestjs/common';
import { HISController } from './app.controller';
import { HISService } from './app.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MongooseModule } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { SharedModule } from '@shared/app.module'
import { HttpModule } from '@nestjs/axios';
const logger = new Logger();

let urlConnectDB = process.env.URL_DB;
urlConnectDB = urlConnectDB?.replace('${DB_USERNAME}', process.env.DB_USERNAME ?? "");
urlConnectDB = urlConnectDB?.replace('${DB_PASS}', process.env.DB_PASS ?? "");
urlConnectDB = urlConnectDB?.replace('${DB_IP}', process.env.DB_IP ?? "");
urlConnectDB = urlConnectDB?.replace('${DB_PORT}', process.env.DB_PORT ?? "");

@Module({
  imports: [
    HttpModule,
    SharedModule,
    MongooseModule.forRoot(
      `${urlConnectDB}${process.env.DB_NAME}`,
      {
        onConnectionCreate: (connection: Connection) => {
          connection.on('open', () => logger.verbose(`Connect to database ${process.env.DB_NAME} success!!!`));
          connection.on('disconnected', () => logger.error(`Disconnect to database ${process.env.DB_NAME} !!!`));
          connection.on('reconnected', () => logger.warn(`ReConnect to database ${process.env.DB_NAME} !!!`));
          return connection;
        },
      }),
    ClientsModule.register([
      {
        name: 'common_used',
        transport: Transport.TCP,
        options: {
          host: '127.0.0.1',
          port: Number(process.env.PORT_SHARED),
        },
      },
      {
        name: 'redis',
        transport: Transport.REDIS,
        options: {
          host: process.env.REDIS_IP,
          port: Number(process.env.REDIS_PORT),
        }
      },

    ]),
  ],
  controllers: [HISController],
  providers: [HISService, HttpModule],
})
export class HISModule { }
