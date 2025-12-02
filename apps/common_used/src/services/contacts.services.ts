import { Injectable, Logger } from '@nestjs/common';
import { Contacts } from '@common_used/schema/contacts.schema';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { LoggerService } from '@shared/logger/logger.services';
import { NotificationService } from './notification.service';
import { title } from 'process';

@Injectable()
export class ContactsService {
    private logger: LoggerService;
    private noti: NotificationService

    constructor(
        @InjectRepository(Contacts)
        private contactsModel: Repository<Contacts>,

    ) {
        this.logger = new LoggerService();
        this.noti = new NotificationService()
    }

    async create(data: any) {
        try {
            if (!data) {
                return false;
            }
            const content = 'vừa tham gia DrOH - Bệnh viện đa khoa bỏ túi!';
            let toIds: any[] = []
            let checkIds: any[] = []


            let ContactHaveCurrentUserPhones: any[] = <any>await this.findWithOptions(
                {
                    profileId: { $nin: [data && data._id ? data._id : ""] },
                    'phones.phones': data && data.username ? data.username : ""
                })

            ContactHaveCurrentUserPhones.forEach((item: any) => {
                const element = <any>{ ...item._doc };

                if (element && element.profileId) {
                    element.phones.forEach((e: any) => {
                        if (e.phones.indexOf((data && data.username ? data.username : "")) > -1 && checkIds.indexOf(element.profileId) < 0) {
                            const name = e.first_name + ' ' + e.last_name + ' ';

                            checkIds.push(element.profileId);

                            toIds.push({ name: name, toId: element.profileId });
                        }
                    });
                }
            });

            for (let i = 0; i < toIds.length; i++) {
                const t = toIds[i];
                if (t && t.toId) {
                    let title = t.name + content;
                    await this.noti.createNoti(
                        null,
                        t && t.toId ? t.toId : "",
                        { postId: data && data._id ? data._id : "" },
                        1,
                        'Từ nay 2 bạn có thể theo dõi và cùng chia sẻ những tiện ích của DrOH',
                        'info',
                        title, false)
                }
            }

            return true
        } catch (ex) {
            this.logger.error(ex)
            return false;
        }
    }

    async findWithOptions(options: any) {
        try {
            if (!options) {
                return false;
            }

            const data = await this.contactsModel.find(options)
            return data
        } catch (ex) {
            this.logger.error(ex)
            return false;
        }
    }
}
