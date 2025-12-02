import { Controller, Logger, Inject, HttpStatus } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { Helper } from '@shared/helper/helper.service';
import { LoggerService } from '@shared/logger/logger.services';
import { ContactsService } from '@common_used/services/contacts.services';
import * as Helpers from '@shared/helper/reponseData';
@Controller('contacts')
export class ContactsController {
    private logger: LoggerService;
    constructor(
        @Inject() private readonly appService: ContactsService,
        @Inject() private readonly Helper: Helper
    ) {
        this.logger = new LoggerService();
    }


    @MessagePattern({ cmd: 'contacts-register' })
    async create(_: any) {
        try {
            const datareq = _ ? _ : {}
            if (!datareq) {
                return this.Helper.ResponseFormat(HttpStatus.BAD_REQUEST, {}, Helpers.ErrInvalidRequest)
            }

            const data = await this.appService.create(datareq)
            return this.Helper.ResponseFormat(HttpStatus.OK, data, '')

        } catch (ex) {
            this.logger.error(ex);

        }
    }


}
