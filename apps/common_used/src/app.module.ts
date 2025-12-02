import { Logger, Module } from '@nestjs/common';
import { ConfigModule } from './config/config.module';

import { VerifyCodeController } from './controller/verify_code.controller';
import { VerifyCodeService } from './services/verify_code.services';
import { SharedModule } from '@shared/app.module'
import { MongooseModule } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { VerifyCodeSchema } from '@common_used/schema/verify_code.schema';

import { TypeOrmModule } from '@nestjs/typeorm';

import { Province } from '@common_used//schema/province.schema';
import { ProvinceController } from './controller/province.controller';
import { ProvinceService } from './services/province.services';

import { District } from '@common_used/schema/district.schema';
import { DistrictsController } from './controller/districts.controller';
import { DistrictsService } from './services/districts.services';
import { Ward } from './schema/ward.schema';
import { WardService } from './services/ward.services';
import { WardController } from './controller/ward.controller';
import { RedisService } from './services/redis.services';
import { RedisController } from './controller/redis.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { PushNotificationService } from './services/push_notification.services';
import { Contacts, ContactsSchema } from './schema/contacts.schema';
import { NotificationSchema } from './schema/notification.schema';
import { ProfilesSocialSchema } from './schema/profiles_social.schema';
import { UploadController } from './controller/upload.controller';
import { Images, ImagesSchema } from './schema/images.schema';
import { Point_AccountSchema } from './schema/point_account.schema';
import { NotificationService } from './services/notification.service';
import { NotificationController } from './controller/notification.controller';
import { ProfilesService } from './services/profiles.service';
import { UploadService } from './services/upload.services';
import { FirebaseModule } from './module/firebase.module';
import { PointAccountService } from './services/point_account.services';


const logger = new Logger();

let urlConnectDB = process.env.URL_DB;
urlConnectDB = urlConnectDB?.replace('${DB_USERNAME}', process.env.DB_USERNAME ?? "");
urlConnectDB = urlConnectDB?.replace('${DB_PASS}', process.env.DB_PASS ?? "");
urlConnectDB = urlConnectDB?.replace('${DB_IP}', process.env.DB_IP ?? "");
urlConnectDB = urlConnectDB?.replace('${DB_PORT}', process.env.DB_PORT ?? "");


@Module({
  imports: [
    SharedModule,
    FirebaseModule,
    MongooseModule.forRoot(
      `${urlConnectDB}${process.env.DB_NAME}`,
      {
        onConnectionCreate: (connection: Connection) => {
          connection.on('open', () => logger.verbose(`Connect to database ${process.env.DB_NAME} success!!!`));
          connection.on('disconnected', () => logger.error(`Disconnect to database ${process.env.DB_NAME} !!!`));
          connection.on('reconnected', () => logger.warn(`ReConnect to database ${process.env.DB_NAME} !!!`));
          return connection;
        },
        connectionName: process.env.DB_NAME
      }),
    MongooseModule.forRoot(
      `${urlConnectDB}${process.env.DB_PAYMENT}`,
      {
        onConnectionCreate: (connection: Connection) => {
          connection.on('open', () => logger.verbose(`Connect to database ${process.env.DB_PAYMENT} success!!!`));
          connection.on('disconnected', () => logger.error(`Disconnect to database ${process.env.DB_PAYMENT} !!!`));
          connection.on('reconnected', () => logger.warn(`ReConnect to database ${process.env.DB_PAYMENT} !!!`));
          return connection;
        },
        connectionName: process.env.DB_PAYMENT
      }),
    MongooseModule.forRoot(
      `${urlConnectDB}${process.env.DB_SOCIAL}`,
      {
        onConnectionCreate: (connection: Connection) => {
          connection.on('open', () => logger.verbose(`Connect to database ${process.env.DB_SOCIAL} success!!!`));
          connection.on('disconnected', () => logger.error(`Disconnect to database ${process.env.DB_SOCIAL} !!!`));
          connection.on('reconnected', () => logger.warn(`ReConnect to database ${process.env.DB_SOCIAL} !!!`));
          return connection;
        },
        connectionName: process.env.DB_SOCIAL
      },

    ),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.MYSQL_IP,
      port: 3306,
      username: process.env.MYSQL_USERNAME,
      password: process.env.MYSQL_PASS,
      database: process.env.MYSQL_DB,
      synchronize: true,
      autoLoadEntities: true,
    }),

    TypeOrmModule.forFeature([Province, District, Ward]),


    MongooseModule.forFeature([{ name: 'verify_code', schema: VerifyCodeSchema }], process.env.DB_NAME),
    MongooseModule.forFeature([{ name: Images.name, schema: ImagesSchema }], process.env.DB_NAME),
    MongooseModule.forFeature([{ name: 'point_account', schema: Point_AccountSchema }], process.env.DB_NAME),



    MongooseModule.forFeature([{ name: 'notifications', schema: NotificationSchema }], process.env.DB_SOCIAL),
    MongooseModule.forFeature([{ name: Contacts.name, schema: ContactsSchema }], process.env.DB_SOCIAL),
    MongooseModule.forFeature([{ name: 'profiles_social', schema: ProfilesSocialSchema }], process.env.DB_SOCIAL),


    ClientsModule.register([
      {
        name: 'users',
        transport: Transport.TCP,
        options: {
          host: '127.0.0.1',
          port: Number(process.env.PORT_USERS),
        },
      },

      {
        name: 'profiles',
        transport: Transport.TCP,
        options: {
          host: '127.0.0.1',
          port: Number(process.env.PORT_PROFILES),
        },
      },

      {
        name: 'accounts',
        transport: Transport.TCP,
        options: {
          host: '127.0.0.1',
          port: Number(process.env.PORT_ACCOUNTS),
        },
      },
      {
        name: 'his',
        transport: Transport.TCP,
        options: {
          host: '127.0.0.1',
          port: Number(process.env.PORT_HIS),
        },
      },
    ]),
  ],
  providers: [
    ConfigModule,
    VerifyCodeService,
    ProvinceService,
    DistrictsService,
    WardService,
    RedisService,
    PushNotificationService,
    NotificationService,
    ProfilesService,
    UploadService,
    PointAccountService
  ],

  controllers: [
    VerifyCodeController,
    ProvinceController,
    DistrictsController,
    WardController,
    RedisController,
    UploadController,
    NotificationController,
    UploadController
  ],

  exports: [
    VerifyCodeService,
    ProvinceService,
    DistrictsService,
    WardService,
    RedisService,
    PushNotificationService,
    NotificationService,
    ProfilesService,
    UploadService,
    PointAccountService
  ]

})
export class CommonModule { }
