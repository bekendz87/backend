import { Controller, HttpStatus } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { NotificationService } from '../services/notification.service'
import * as Helpers from '@shared/helper/reponseData';
import { LoggerService } from '@shared/logger/logger.services';
import { Helper } from '@shared/helper/helper.service';



@Controller('notification')
export class NotificationController {
    private logger: LoggerService;
    private Helper: Helper
    constructor(private readonly notificationService: NotificationService) {
        this.logger = new LoggerService()
        this.Helper = new Helper()
    }

    @MessagePattern({ cmd: 'noti-list' })
    async getList(req: any) {
        try {
            const data = await this.notificationService.list(req);
            return this.Helper.ResponseFormat(HttpStatus.OK, data, {})
        } catch (ex) {
            this.logger.error(ex)
            return this.Helper.ResponseFormat(HttpStatus.OK, '', Helpers.ErrNotFound)
        }

    }

    @MessagePattern({ cmd: 'noti-seen' })
    async seenNoti(_: any) {
        try {
            const { id, params } = _
            if (!id) {
                return this.Helper.ResponseFormat(HttpStatus.OK, '', Helpers.ErrInvalidRequest)
            }

            const data = await this.notificationService.seenNoti(id, params);
            return this.Helper.ResponseFormat(HttpStatus.OK, data, {})
        } catch (ex) {
            this.logger.error(ex)
            return this.Helper.ResponseFormat(HttpStatus.OK, '', Helpers.ErrNotFound)
        }
    }

    @MessagePattern({ cmd: 'noti-count-not-seen' })
    async countSeen(req: any) {
        try {

            const data = await this.notificationService.countNotSeen(req);
            return this.Helper.ResponseFormat(HttpStatus.OK, data, {})

        } catch (ex) {
            this.logger.error(ex)
            return this.Helper.ResponseFormat(HttpStatus.OK, '', Helpers.ErrNotFound)
        }
    }

    @MessagePattern({ cmd: 'noti-send' })
    async sendNoti(_: any) {
        try {
            const { params, body } = _

            const data = this.notificationService.sendNoti(body, params);
            return this.Helper.ResponseFormat(HttpStatus.OK, data, {})

        } catch (ex) {
            this.logger.error(ex)
            return this.Helper.ResponseFormat(HttpStatus.OK, '', Helpers.ErrNotFound)
        }
    }

}
