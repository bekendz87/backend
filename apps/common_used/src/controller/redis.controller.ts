import { Controller, Get, Logger, Inject, HttpStatus } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { Helper } from '@shared/helper/helper.service';
import { LoggerService } from '@shared/logger/logger.services';
import * as Helpers from '@shared/helper/reponseData';
import { RedisService } from '@common_used/services/redis.services';

@Controller('redis')
export class RedisController {
    private logger: LoggerService;
    constructor(
        @Inject() private readonly appService: RedisService,
        @Inject() private readonly Helper: Helper
    ) {
        this.logger = new LoggerService();
    }


    @MessagePattern({ cmd: 'redis-get' })
    async getData(_: any) {
        try {
            const key = _ && _.key ? _.key : ""
            if (!key) {
                this.logger.error(Helpers.ErrRedisNotFound)
                return this.Helper.ResponseFormat(HttpStatus.BAD_REQUEST, {}, Helpers.ErrRedisNotFound)
            }

            const data = await this.appService.getValue(key)
            return this.Helper.ResponseFormat(HttpStatus.OK, data, '')

        } catch (ex) {
            this.logger.error(ex);

        }
    }
    @MessagePattern({ cmd: 'redis-set' })
    async setData(_: any) {
        try {
            const key = _ && _.key ? _.key : ""
            const value = _ && _.value ? _.value : ""
            const ex = _ && _.ex ? _.ex : 15

            if (!key) {
                this.logger.error(Helpers.ErrRedisNotFound)
                return this.Helper.ResponseFormat(HttpStatus.BAD_REQUEST, {}, Helpers.ErrRedisNotFound)
            }

            if (!value) {
                this.logger.error(Helpers.ErrRedisNotFound)
                return this.Helper.ResponseFormat(HttpStatus.BAD_REQUEST, {}, Helpers.ErrRedisNotFound)
            }

            const data = await this.appService.setValue(key, value, ex)
            return this.Helper.ResponseFormat(HttpStatus.OK, data, '')

        } catch (ex) {
            this.logger.error(ex);

        }
    }

    @MessagePattern({ cmd: 'redis-check-ex' })
    async checkEx(_: any) {
        try {
            const key = _ && _.key ? _.key : ""
            if (!key) {
                this.logger.error(Helpers.ErrRedisNotFound)
                return this.Helper.ResponseFormat(HttpStatus.BAD_REQUEST, {}, Helpers.ErrRedisNotFound)
            }

            const data = await this.appService.checkEx(key)
            if (data) {
                if (data == -2) {
                    await this.appService.setValue(key, '', 0)
                    return this.Helper.ResponseFormat(HttpStatus.BAD_REQUEST, '', Helpers.ErrRedisNotFound)
                }

                if (data == -1) {
                    return this.Helper.ResponseFormat(HttpStatus.BAD_REQUEST, '', Helpers.ErrRedisHaveNotEx)
                }

                return this.Helper.ResponseFormat(HttpStatus.OK, data, '')

            }

        } catch (ex) {
            this.logger.error(ex);

        }
    }

}
