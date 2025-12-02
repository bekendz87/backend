import { Controller, Get, Logger, Inject, HttpStatus } from '@nestjs/common';
import { WardService } from '../services/ward.services';
import { MessagePattern } from '@nestjs/microservices';
import { Helper } from '@shared/helper/helper.service';
import { LoggerService } from '@shared/logger/logger.services';

@Controller('ward')
export class WardController {
    private logger: LoggerService;
    constructor(
        @Inject() private readonly appService: WardService,
        @Inject() private readonly Helper: Helper
    ) {
        this.logger = new LoggerService();
    }


    @MessagePattern({ cmd: 'ward-find-byId' })
    async findByID(_: any) {
        try {
            const id = _ && _.id ? _.id : ""
            if (!id) {
                return this.Helper.ResponseFormat(HttpStatus.BAD_REQUEST, {}, 'Không tìm thấy ID  của Phường/Xã !')
            }

            const data = await this.appService.findByID(id)
            return this.Helper.ResponseFormat(HttpStatus.OK, data, '')

        } catch (ex) {
            this.logger.error(ex);

        }
    }

    @MessagePattern({ cmd: 'ward-find-byName-AndDistricID' })
    async findWithNameAndDistrictID(_: any) {
        try {
            const name = _ && _.name ? _.name : ""
            const districtId = _ && _.districtId ? _.districtId : ""
            if (!name) {
                return this.Helper.ResponseFormat(HttpStatus.BAD_REQUEST, {}, 'Không tìm thấy tên  của Phường/Xã !')
            }
            if (!districtId) {
                return this.Helper.ResponseFormat(HttpStatus.BAD_REQUEST, {}, 'Không tìm thấy ID  của Quận/Huyện !')
            }

            const data = await this.appService.findByDistricIDAndName(districtId, name)
            return this.Helper.ResponseFormat(HttpStatus.OK, data, '')

        } catch (ex) {
            this.logger.error(ex);

        }
    }


}
