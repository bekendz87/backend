import { Controller, Get, Logger, Inject, HttpStatus } from '@nestjs/common';
import { VerifyCodeService } from '../services/verify_code.services';
import { MessagePattern } from '@nestjs/microservices';
import { Helper } from '@shared/helper/helper.service';
import { LoggerService } from '@shared/logger/logger.services';

@Controller('verify-code')
export class VerifyCodeController {
    private logger: LoggerService;
    constructor(
        @Inject() private readonly appService: VerifyCodeService,
        @Inject() private readonly Helper: Helper
    ) {
        this.logger = new LoggerService();
    }


    @MessagePattern({ cmd: 'verify-code-find-byId' })
    async findByID(_: any) {
        try {
            const id = _ && _.id ? _.id : ""
            if (!id) {
                return this.Helper.ResponseFormat(HttpStatus.BAD_REQUEST, {}, 'Không tìm thấy ID của Tỉnh/Thành Phố !')
            }

            const data = await this.appService.findByID(id)
            return this.Helper.ResponseFormat(HttpStatus.OK, data, '')

        } catch (ex) {
            this.logger.error(ex);

        }
    }


}
