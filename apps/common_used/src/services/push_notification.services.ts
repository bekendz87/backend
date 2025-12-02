import { Injectable, Logger } from '@nestjs/common';
import { LoggerService } from '@shared/logger/logger.services';
import * as admin from 'firebase-admin';
import * as serviceAccount from '../constans/keys';
import * as Helpers from '@shared/helper/reponseData';


@Injectable()
export class PushNotificationService {
    private admin: admin.app.App;
    private logger: LoggerService;


    constructor(

    ) {
        this.logger = new LoggerService();
        this.admin = admin.initializeApp({
            credential: admin.credential.cert(serviceAccount.keys as admin.ServiceAccount),
        });

    }

    async SendNotification(title: string, regToken: string, dataSend: any, body: any) {
        try {
            const registrationToken = regToken;

            const message = <any>{
                token: registrationToken,
                "notification": {
                    "title": title,
                    body: body
                },
                data: dataSend,
                "android": {
                    "priority": "normal",
                    "notification": {
                        "title": title,
                        body: body,
                        "sound": "default"
                    }
                },
                apns: {
                    payload: {
                        aps: {
                            alert: {
                                title: title,
                                body: body
                            },
                            badge: Number(dataSend.badge),
                            sound: 'default',
                        },
                    },
                },
                "webpush": {
                    "headers": {
                        "Urgency": "high"
                    }
                }
            }

            const response = await this.admin.messaging().send(message)
            if (!response) {
                this.logger.error(Helpers.ErrPushNoti)
                return response
            }

            return response
        } catch (ex) {
            this.logger.error(ex)
            return ex
        }
    }

    FormatData(title: string, body: any, type: string, extra: any, badge: number, sound: string) {
        try {
            if (body.length > 255) {
                body = body.substring(0, 252) + "..."
            }


            const data = {
                title: title,
                body: body,
                type: type && type.toString() || '',
                extra: extra && JSON.stringify(extra) || '',
                sound: sound,
                badge: badge
            }

            return data
        } catch (ex) {
            this.logger.error(ex)
            return ex
        }
    }

    async PushNotification(data: any) {
        try {

            if (!data) {
                return false;
            }

            if (!data.firebaseToken) {
                return false;
            }

            let regToken = data.firebaseToken;

            const notificationData = <any>this.FormatData(
                data && data.title ? data.title : "",
                data && data.body ? data.body : "",
                data && data.type ? data.type : "",
                data && data.extra ? data.extra : "",
                data && data.badge ? data.badge : "",
                data && data.sound ? data.sound : "")

            let pushDetail = <any>{
                data: {
                    data: ''
                },
                priority: 'high',
                contentAvailable: true
            }

            if (data.os && data.os.trim().toUpperCase() !== "IOS") {
                pushDetail.notification = {
                    badge: notificationData && notificationData.badge ? notificationData.badge : 0
                }
            };

            const result = await this.SendNotification(data.title, regToken, notificationData, data.body)

            if (result) {
                return result;
            }

            return false;
        } catch (ex) {
            this.logger.error(ex)
            return ex
        }
    }


}
