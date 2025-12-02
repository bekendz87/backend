import { Injectable, Logger } from '@nestjs/common';
import { District } from '@common_used/schema/district.schema';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { LoggerService } from '@shared/logger/logger.services';

@Injectable()
export class DistrictsService {
    private logger: LoggerService;

    constructor(
        @InjectRepository(District)
        private districtsModel: Repository<District>,

    ) {
        this.logger = new LoggerService();
    }

    async findByID(id: number) {
        try {
            if (!id) {
                return false;
            }

            const data = await this.districtsModel.findBy({ district_id: id })

            return data
        } catch (ex) {
            this.logger.error(ex)
            return false;
        }
    }
    
    async findByIDProvices(id: number) {
        try {
            if (!id) {
                return false;
            }

            const data = await this.districtsModel.find({
                where: {
                    province_id: id,
                    disabled: 0,
                },
                order: {
                    vi_name: 'ASC',
                    en_name: 'ASC',
                },
            });

            return data
        } catch (ex) {
            this.logger.error(ex)
            return false;
        }
    }
}
