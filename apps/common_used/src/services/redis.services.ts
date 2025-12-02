import { Injectable, Logger } from '@nestjs/common';
import { LoggerService } from '@shared/logger/logger.services';
import Redis from 'ioredis'

@Injectable()
export class RedisService {
    private logger: LoggerService;
    private redis: Redis;
    constructor(

    ) {
        this.logger = new LoggerService();
        this.redis = new Redis()
    }

    async getValue(key: string) {
        try {
            if (!key) {
                return false
            }

            return await <any>this.redis.get(key)
        } catch (ex) {
            this.logger.error(ex)
            return {}
        }
    }

    async setValue(key: string, value: string, ex: number) {
        try {
            if (!key) {
                return false
            }
            if (!value) {
                return false
            }

            if (!ex || ex == 0) {
                return false
            }

            return await <any>this.redis.set(key, value, "EX", ex)
        } catch (ex) {
            this.logger.error(ex)
            return {}
        }
    }

    async checkEx(key: string) {
        try {
            if (!key) {
                return false
            }

            return await <any>this.redis.ttl(key)   
        } catch (ex) {
            this.logger.error(ex)
            return {}
        }
    }

}
