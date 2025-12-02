import { isObjectIdOrHexString, Model } from 'mongoose';
import { HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientProxy } from '@nestjs/microservices';
import * as Helpers from '@shared/helper/reponseData';
import { firstValueFrom } from 'rxjs';
import { LoggerService } from '@shared/logger/logger.services';
import { Helper } from '@shared/helper/helper.service';


const url = process && process.env && process.env.URL_IMAGE ? process.env.URL_IMAGE : ""
const physical_path = process && process.env && process.env.PHYSICAL_PATH ? process.env.PHYSICAL_PATH : ""

@Injectable()
export class ProfilesService {
    private logger: LoggerService;
    constructor(

        @Inject('profiles') private readonly profiles: ClientProxy,
        private readonly Helper: Helper,
    ) {
        this.logger = new LoggerService();

    }



    async FindByIDWithoutActive(id: any) {
        try {
            const pattern = { cmd: 'profiles-find-id' };

            if (!id) {
                return false
            }


            const payload = {
                id: id
            }

            const data = await firstValueFrom(this.profiles.send<any>(pattern, payload))

            return data
        } catch (ex) {
            this.logger.error(ex)
            return ex
        }
    }
}