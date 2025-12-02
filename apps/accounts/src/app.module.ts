import { Module, Logger } from '@nestjs/common';
import { AccountsController } from './app.controller';
import { AccountsService } from './app.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MongooseModule } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { Accounts, AccountsSchema } from './schema/account.schema';
import { SharedModule } from '@shared/app.module';
import { LoggerService } from '@shared/logger/logger.services';
import { CommonModule } from '@common_used/app.module'
const logger = new LoggerService();

let urlConnectDB = process.env.URL_DB;
urlConnectDB = urlConnectDB?.replace('${DB_USERNAME}', process.env.DB_USERNAME ?? "");
urlConnectDB = urlConnectDB?.replace('${DB_PASS}', process.env.DB_PASS ?? "");
urlConnectDB = urlConnectDB?.replace('${DB_IP}', process.env.DB_IP ?? "");
urlConnectDB = urlConnectDB?.replace('${DB_PORT}', process.env.DB_PORT ?? "");

@Module({
  imports: [
    SharedModule,
    CommonModule,
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
    MongooseModule.forFeature([{ name: Accounts.name, schema: AccountsSchema }]),
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
        name: 'users',
        transport: Transport.TCP,
        options: {
          host: '127.0.0.1',
          port: Number(process.env.PORT_USERS),
        },
      },

    ]),
  ],
  controllers: [AccountsController],
  providers: [AccountsService],
})
export class AccountsModule { }
