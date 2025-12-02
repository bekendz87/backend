import { Controller,  Logger, Inject, HttpStatus } from '@nestjs/common';
import { DistrictsService } from '../services/districts.services';
import { MessagePattern } from '@nestjs/microservices';
import { Helper } from '@shared/helper/helper.service';
import { LoggerService } from '@shared/logger/logger.services';

@Controller('districts')
export class DistrictsController {
    private logger: LoggerService;
    constructor(
        @Inject() private readonly appService: DistrictsService,
        @Inject() private readonly Helper: Helper
    ) {
        this.logger = new LoggerService();
    }


    @MessagePattern({ cmd: 'districts-find-byId' })
    async findByID(_: any) {
        try {
            const id = _ && _.id ? _.id : ""
            if (!id) {
                return this.Helper.ResponseFormat(HttpStatus.BAD_REQUEST, {}, 'Không tìm thấy ID  của Quận/Huyện !')
            }

            const data = await this.appService.findByID(id)
            return this.Helper.ResponseFormat(HttpStatus.OK, data, '')

        } catch (ex) {
            this.logger.error(ex);

        }
    }


}
