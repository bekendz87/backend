import { Controller, HttpStatus } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { NotificationService } from '../services/notification.service'
import * as Helpers from '@shared/helper/reponseData';
import { LoggerService } from '@shared/logger/logger.services';
import { Helper } from '@shared/helper/helper.service';
import { PointAccountService } from '@common_used/services/point_account.services';



@Controller('point_account')
export class Point_AccountController {
    private logger: LoggerService;
    private Helper: Helper
    constructor(
        private readonly pointAccountService: PointAccountService
    ) {
        this.logger = new LoggerService()
        this.Helper = new Helper()
    }

    @MessagePattern({ cmd: 'point-account-findOne' })
    async findOnePoint(_: any) {
        try {
            const userId = _ && _.userId ? _.userId : ""
            if (!userId) {
                return false
            }
            const data = await this.pointAccountService.findOne(userId);
            return data
        } catch (ex) {
            this.logger.error(ex)
            return ex
        }

    }

  


}
