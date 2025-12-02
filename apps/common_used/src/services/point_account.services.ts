import { isObjectIdOrHexString, Model, SchemaTypes, Types } from "mongoose";
import { InjectConnection, InjectModel, Schema } from "@nestjs/mongoose";
import { Inject, Injectable, Logger } from "@nestjs/common";
import * as Helper from '@shared/helper/reponseData';
import { LoggerService } from "@shared/logger/logger.services";
import { Point_Account } from "@common_used/schema/point_account.schema";


@Injectable()
export class PointAccountService {
    private logger: LoggerService

    constructor(
        @InjectModel('point_account', process.env.DB_NAME || "OneHealthDB")
        private readonly pointAccountModel: Model<Point_Account>

    ) {
        this.logger = new LoggerService()
    }

    async findOne(userId: string) {
        try {

            if (!userId) {
                return false
            }

            if (!isObjectIdOrHexString(userId)) {
                return false
            }

            const data = await this.pointAccountModel.findOne({ user: userId })

            return data
        } catch (ex) {
            this.logger.error(ex)
            return ex
        }
    }

    async historyPoint(_: any) {
        try {
            const { userId,sort,skip ,limit} = _
            let match = [
                {
                    $match: {
                        user: userId,
                       // pointAccount: data._id
                    }
                },
                {
                    $sort: sort
                },
                {
                    $skip: skip
                },
                {
                    $limit: limit
                }
            ]

            const data = await this.pointAccountModel.aggregate()

        } catch (ex) {
            this.logger.error(ex)
            return ex
        }
    }

}
