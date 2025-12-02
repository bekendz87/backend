import { Injectable, Logger } from '@nestjs/common';
import { Province } from '@common_used/schema/province.schema';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { LoggerService } from '@shared/logger/logger.services';

@Injectable()
export class ProvinceService {
    private logger: LoggerService;

    constructor(
        @InjectRepository(Province)
        private provinceModel: Repository<Province>,
    ) {
        this.logger = new LoggerService();
    }

    async findByID(id: number) {
        try {
            if (!id) {
                return false;
            }

            const data = await this.provinceModel.findBy({ province_id: id })
            return data
        } catch (ex) {
            this.logger.error(ex)
            return false;
        }
    }
    async getAll() {
        try {
            const data = await this.provinceModel.find({})
            return data
        } catch (ex) {
            this.logger.error(ex)
            return false;
        }
    }
}
