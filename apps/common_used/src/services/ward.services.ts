import { Injectable, Logger } from '@nestjs/common';
import { Ward } from '@common_used/schema/ward.schema';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { LoggerService } from '@shared/logger/logger.services';
import { Like } from 'typeorm';
@Injectable()
export class WardService {
    private logger: LoggerService;

    constructor(
        @InjectRepository(Ward)
        private wardModel: Repository<Ward>,
    ) {
        this.logger = new LoggerService();
    }

    async findByID(id: number) {
        try {
            if (!id) {
                return false;
            }

            const data = await this.wardModel.findBy({ ward_id: id })

            return data
        } catch (ex) {
            this.logger.error(ex)
            return false;
        }
    }

    async findByDistricIDAndName(id: number, name: string) {
        try {
            if (!id) {
                return false;
            }

            const data = await this.wardModel.findBy({ district_id: id, vi_name: Like(`%${name}%`) })

            return data
        } catch (ex) {
            this.logger.error(ex)
            return false;
        }
    }

    async findByIDDistricts(id: number) {
        try {
            if (!id) {
                return false;
            }

            const data = await this.wardModel.find({
                where: {
                    district_id: id,
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
