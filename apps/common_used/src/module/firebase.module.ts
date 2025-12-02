import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FirebaseTokenSchema } from '../schema/firebase.schema';
import { FirebaseService } from './firebase.service';
import { FirebaseController } from './firebase.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
@Module({
    imports: [
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
        MongooseModule.forFeature(
            [{ name: 'firebase_token', schema: FirebaseTokenSchema }],
            process.env.DB_NAME
        ),
    ],
    providers: [FirebaseService],
    controllers: [FirebaseController],
    exports: [FirebaseService],
})
export class FirebaseModule { }
