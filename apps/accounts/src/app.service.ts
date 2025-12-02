import { isObjectIdOrHexString, Model } from 'mongoose';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { ClientProxy } from '@nestjs/microservices';

import { Helper } from '@shared/helper/helper.service';
import { firstValueFrom } from 'rxjs';
import { faker } from '@faker-js/faker';
import * as Helpers from '@shared/helper/reponseData';
import { Accounts, AccountsSchema } from './schema/account.schema';
import { LoggerService } from '@shared/logger/logger.services';

const url = process && process.env && process.env.URL_IMAGE ? process.env.URL_IMAGE : ""
const physical_path = process && process.env && process.env.PHYSICAL_PATH ? process.env.PHYSICAL_PATH : ""

@Injectable()
export class AccountsService {
    private logger: LoggerService;
    constructor(
        @InjectModel(Accounts.name) private accountsModel: Model<Accounts>,
        @Inject('common_used') private readonly commonUsed: ClientProxy,
        @Inject('users') private readonly users: ClientProxy,
        private readonly Helper: Helper,
    ) {
        this.logger = new LoggerService();
    }

    async create(_: any) {
        try {
            if (!_) {
                return Helpers.ErrInvalidRequest
            }

            const data = await this.accountsModel.create(_);
            return data

        } catch (ex) {
            this.logger.error(ex)
            return ex
        }
    }

    async findAccountsUserWithId(id: string) {
        try {
            if (!id) {
                return false
            }

            const data = await this.accountsModel.findOne({ user: id })
            return data
        } catch (ex) {
            this.logger.error(ex)
            return ex
        }
    }

    async FindOneByUserID(id: string, options: any) {
        try {
            if (!id) {
                return false
            }
            let excludeField = {}

            if (options) {
                if (options.excludeField) {
                    for (let i = 0; i < options.excludeField.length; i++) {
                        excludeField[options.excludeField[i]] = 0;
                    }
                }
            }

            const data = await this.accountsModel
                .findOne({ user: id }, excludeField)
                // .populate([{ path: 'current_payment' },
                // { path: 'pendingPayments' }]);

            return data
        } catch (ex) {
            this.logger.error(ex)
            return ex
        }
    }

    async findUsers(id: String) {
        try {
            if (!id) {
                return false
            }
            const pattern = { cmd: 'find-users-by-id' }
            const payload = {
                id: id
            }

            return await firstValueFrom(this.users.send(pattern, payload));
        } catch (ex) {
            this.logger.error(ex)
            return ex
        }
    }

}