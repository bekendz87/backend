import { isObjectIdOrHexString, Model } from 'mongoose';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientProxy } from '@nestjs/microservices';
import { Helper } from '@shared/helper/helper.service';
import { faker } from '@faker-js/faker';
import * as Helpers from '@shared/helper/reponseData';
import { LoggerService } from '@shared/logger/logger.services';
import { ConfigService } from '@nestjs/config';
import { Constant } from './constanst/path.constant';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import Redis from 'ioredis'



const url = process && process.env && process.env.URL_IMAGE ? process.env.URL_IMAGE : ""
const physical_path = process && process.env && process.env.PHYSICAL_PATH ? process.env.PHYSICAL_PATH : ""
const config = new ConfigService()
@Injectable()
export class HISService {
    private logger: LoggerService;
    private readonly httpService: HttpService
    private redis: Redis
    constructor(
        @Inject('common_used') private readonly commonUsed: ClientProxy,
        private readonly Helper: Helper,

    ) {
        this.logger = new LoggerService();
        this.httpService = new HttpService()
        this.redis = new Redis()
    }

    async login(meta: any, hospital_source: any) {
        try {


            let hospital_sources = ""
            if (hospital_source && !hospital_source.hospital_source) {
                hospital_sources = (hospital_source && hospital_source.toLocaleUpperCase() ? hospital_source.toLocaleUpperCase() : "")
            } else {
                hospital_sources = (hospital_source && hospital_source.hospital_source && hospital_source.hospital_source.toLocaleUpperCase() ? hospital_source.hospital_source.toLocaleUpperCase() : "")
            }

            const Config = config.get<any>(hospital_sources)
            const Configs = JSON.parse(Config)

            const router = Constant.HIS_LOGIN
            const username = Configs.username
            const password = Configs.password

            const headers = {
                Authorization: 'Basic ' + Constant.HIS_AUTH,
                appKey: Constant.HIS_TOKEN,
                'Content-Type': 'application/json',
                meta
            };

            const userKeyHis = <any>await this.getRedis(`his_user_key_${hospital_source}`)
            if (userKeyHis && userKeyHis.status == 200 && userKeyHis.one_health_msg != null) {
                headers['userKey'] = userKeyHis ? userKeyHis : ""
            }

            const requestOptions = {
                url: Configs.domain + router,
                method: 'POST',
                headers: headers,
                data: {
                    username,
                    password
                },
            };


            const response = <any>await firstValueFrom(this.httpService.request(requestOptions));
            const dataReponse = response && response.data ? response.data : {}

            if (dataReponse === 'Service timeout. Please retry') {
                this.logger.debug('========= API_LOGIN ERROR ==========')
                this.logger.debug('Timeout. Không thể kết nối đến hệ thống HIS')
                return Helpers.ErrRequestTimoutHis
            }

            if (dataReponse.error.code !== 200 || dataReponse.success == false) {
                this.logger.error(dataReponse.error.message)
                return dataReponse
            }

            if (userKeyHis.one_health_msg == null) {
                if (dataReponse.data && dataReponse.data.security && dataReponse.data.security.secret) {
                    await this.setRedis(`his_user_key_${hospital_source}`,
                        dataReponse && dataReponse.data && dataReponse.data.security &&
                            dataReponse.data.security.secret ? dataReponse.data.security.secret : "", 15)
                }
            }



            return dataReponse;

        } catch (ex) {
            this.logger.error(ex)
            return ex
        }
    }

    async searchPatient(data: any) {
        try {
            let dataReq = <any>{}

            const hospital_source = data && data.source ? data.source : ""
            if (!hospital_source) {
                return false
            }

            const checkEx = await this.checkEx(`his_user_key_${hospital_source}`)
            if (!checkEx || checkEx.status != 200) {
                await this.login({}, hospital_source)
            }

            let userKeyHis = <any>await this.getRedis(`his_user_key_${hospital_source}`)

            if (userKeyHis && userKeyHis.status == 200 && userKeyHis.one_health_msg != null) {
                userKeyHis = userKeyHis && userKeyHis.one_health_msg ? userKeyHis.one_health_msg : ""
            }

            const Config = config.get<any>(hospital_source.toLocaleUpperCase())
            const Configs = JSON.parse(Config)
            const route = Constant.FIND_HIS_PROFILE;

            if (data.phone) {
                dataReq.phone_number = data.phone;
            }

            if (data.patient_code) {
                dataReq.patient_code = data.patient_code
            }


            const headers = {
                Authorization: 'Basic ' + Constant.HIS_AUTH,
                appKey: Constant.HIS_TOKEN,
                'Content-Type': 'application/json',
                userkey: userKeyHis
            };

            const requestOptions = {
                url: Configs.domain + route,
                method: "POST",
                data: dataReq,
                headers: headers,
                json: true
            }

        
            const response = <any>await firstValueFrom(this.httpService.request(requestOptions));
            const dataReponse = response && response.data ? response.data : {}

        

            if (dataReponse === 'Service timeout. Please retry') {
                this.logger.debug('========= FIND_HIS_PROFILE ERROR ==========')
                this.logger.debug('Timeout. Không thể kết nối đến hệ thống HIS')
                return Helpers.ErrRequestTimoutHis
            }

            if (dataReponse.error.code !== 200 && dataReponse.success == false) {
                this.logger.error(dataReponse.error.message)
                return dataReponse
            }

            return dataReponse


        } catch (ex) {
            this.logger.error(ex)
            return ex
        }
    }

    async getRedis(key: string) {
        try {
            const pattern = { cmd: 'redis-get' };
            if (!key) {
                return {}
            }

            const payload = {
                key: key
            }

            const reponse = await firstValueFrom(this.commonUsed.send<any>(pattern, payload));
            return reponse

        } catch (ex) {
            this.logger.error(ex)
            return ex
        }
    }

    async setRedis(key: string, value: string, ex: number) {
        try {
            const pattern = { cmd: 'redis-set' };
            if (!key) {
                return {}
            }

            if (!value) {
                return {}
            }

            const payload = {
                key: key,
                value: value,
                ex: ex
            }

            const reponse = await firstValueFrom(this.commonUsed.send<any>(pattern, payload));
            return reponse

        } catch (ex) {
            this.logger.error(ex)
            return ex
        }
    }

    async checkEx(key: string) {
        try {
            const pattern = { cmd: 'redis-check-ex' };
            if (!key) {
                return {}
            }

            const payload = {
                key: key
            }

            const reponse = await firstValueFrom(this.commonUsed.send<any>(pattern, payload));
            return reponse

        } catch (ex) {
            this.logger.error(ex)
            return ex
        }
    }
}