import { Injectable, Logger } from '@nestjs/common';
import { VerifyCode } from '@common_used/schema/verify_code.schema';
import { isObjectIdOrHexString, Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { LoggerService } from '@shared/logger/logger.services';


@Injectable()
export class VerifyCodeService {
    private logger: LoggerService;

    constructor(
        @InjectModel('verify_code', process.env.DB_NAME || "OneHealthDB") private verifyCodeModel: Model<VerifyCode>
    ) {
        this.logger = new LoggerService();
    }

    async findByID(id: string) {
        try {
            if (!id) {
                return false;
            }

            if (!isObjectIdOrHexString(id)) {
                return false
            }

            const data = await this.verifyCodeModel.findById({ _id: id })

            return data
        } catch (ex) {
            this.logger.error(ex)
            return false;
        }
    }
}
