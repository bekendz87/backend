import { HttpStatus, Inject, Injectable, Logger } from "@nestjs/common";
import { FirebaseToken } from "../schema/firebase.schema";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import * as Helpers from '@shared/helper/reponseData';
import { LoggerService } from "@shared/logger/logger.services";
import { Helper } from "@shared/helper/helper.service";
import { ClientProxy } from "@nestjs/microservices";
import { firstValueFrom } from 'rxjs';

@Injectable()
export class FirebaseService {
    private Helper: Helper
    private logger: LoggerService

    constructor(
        @Inject('users') private readonly users: ClientProxy,
        @InjectModel('firebase_token', process.env.DB_NAME || 'OneHealthDB') private firebaseModel: Model<FirebaseToken>
    ) {
        this.logger = new LoggerService()
        this.Helper = new Helper()
    }

    async getAll() {
        try {

            const list = await this.firebaseModel.find({}).populate({ path: 'user', select: ['username', 'first_name', 'last_name'] });

            return this.Helper.ResponseFormat(HttpStatus.OK, list, '')
        } catch (ex) {
            this.logger.error(ex)
            return this.Helper.ResponseFormat(HttpStatus.BAD_REQUEST, '', ex);
        }

    }

    async create(data: any) {
        try {
            const { userId, token } = data
            const checkFirebase = await this.findOneByUserOrToken(userId, token)

            if (checkFirebase.length == 0) {

                const createFBT = await this.firebaseModel.create({ user: userId, token })
                if (!createFBT) {
                    return this.Helper.ResponseFormat(HttpStatus.BAD_GATEWAY, '', Helpers.ErrCreateFirebase)
                }

                return this.Helper.ResponseFormat(HttpStatus.OK, createFBT, '')
            } else {

                const updateFBT = await this.firebaseModel.findByIdAndUpdate({ user: userId }, { $set: { token: token } })
                if (!updateFBT) {
                    return this.Helper.ResponseFormat(HttpStatus.BAD_GATEWAY, '', Helpers.ErrCreateFirebase)
                }

                return this.Helper.ResponseFormat(HttpStatus.OK, Helpers.ReponseUpdateFireBase, '')
            }


        } catch (ex) {
            this.logger.error(ex)
            return this.Helper.ResponseFormat(HttpStatus.BAD_REQUEST, '', ex);
        }
    }

    async findOneByUserOrToken(userid: string, token: string) {
        try {
            const result = <any>await this.firebaseModel.findById({ $or: [{ user: userid }, { token: token }] })
                .sort({ created_time: -1 })
                .populate({ path: 'user', select: ['username', 'first_name', 'last_name'] });

            if (result.length == 0) {
                return [];
            }

            return result;
        } catch (ex) {
            this.logger.error(ex)
            return this.Helper.ResponseFormat(HttpStatus.BAD_REQUEST, '', ex);
        }
    }

    async updateDeviceId(data: any) {
        try {
            const { userId, token, device_id } = data;

            const dataCreate = {
                user: userId,
                token: token,
                device_id: device_id
            }

            let userInfo = await this.updateDeviceUser(userId, device_id)

            if (userInfo && userInfo.status == 200) {
                userInfo = userInfo && userInfo.one_health_msg ? userInfo.one_health_msg : {}
            }

            const checkFirebaseToken = await this.findOneByUserOrToken(userId, '');
            if (!checkFirebaseToken || checkFirebaseToken.length == 0) {

                const createFirebase = await this.firebaseModel.create(dataCreate);
                if (!createFirebase) {
                    return this.Helper.ResponseFormat(HttpStatus.BAD_GATEWAY, '', Helpers.ErrCreateFirebase)
                }

                return this.Helper.ResponseFormat(HttpStatus.OK, Helpers.ReponseUpdateFireBase, '')
            }

            const updateDevice = await this.firebaseModel.findByIdAndUpdate(
                { _id: checkFirebaseToken && checkFirebaseToken._id ? checkFirebaseToken._id : "" },
                { $set: { device_id: device_id } }
            )

            if (!updateDevice) {
                return this.Helper.ResponseFormat(HttpStatus.BAD_GATEWAY, '', Helpers.ErrUpdate)
            }

            if (userInfo.device_id) {

                let notiData = <any>{
                    title: 'Đăng xuất tài khoản',
                    body: 'Tài khoản của bạn vừa đươc log out trên thiết bị khác.'
                };
                notiData.title = notiData.title;
                notiData.body = notiData.body
                notiData.type = 15;
                notiData.extra = null;
                notiData.os = '';

            }
            return this.Helper.ResponseFormat(HttpStatus.OK, Helpers.ReponseUpdateFireBase, '')
        } catch (ex) {
            this.logger.error(ex);
            return this.Helper.ResponseFormat(HttpStatus.BAD_GATEWAY, '', Helpers.ErrNotFound)
        }

    }

    async updateWithMultiOptions(id: any, options: any) {
        try {
            if (!options) {
                return this.Helper.ResponseFormat(HttpStatus.BAD_GATEWAY, '', Helpers.ErrInvalidRequest)

            }

            const updateOptions = await this.firebaseModel.findByIdAndUpdate({ _id: id }, { $set: options });
            if (!updateOptions) {
                return this.Helper.ResponseFormat(HttpStatus.BAD_GATEWAY, '', Helpers.ErrUpdate)
            }

            return this.Helper.ResponseFormat(HttpStatus.OK, Helpers.ReponseUpdateFireBase, '')
        } catch (ex) {
            this.logger.error(ex);
            return this.Helper.ResponseFormat(HttpStatus.BAD_GATEWAY, '', Helpers.ErrNotFound)
        }
    }

    async updateDeviceUser(userId: string, device_id: any) {
        try {
            const pattern = { cmd: 'find-users-and-update-device' };
            if (!userId) {
                return false
            }

            if (!device_id) {
                return false
            }

            const payload = {
                device_id: device_id,
                userId: userId
            }

            const data = await firstValueFrom(this.users.send<any>(pattern, payload))

            return data

        } catch (ex) {
            this.logger.error(ex);
            return this.Helper.ResponseFormat(HttpStatus.BAD_GATEWAY, '', Helpers.ErrNotFound)
        }
    }

    async FindByUserID(userId: string) {
        try {
            if (!userId) {
                return false
            }
            const data = await this.firebaseModel.findOne({ user: userId })
            return data
        } catch (ex) {
            this.logger.error(ex);
            return this.Helper.ResponseFormat(HttpStatus.BAD_REQUEST, '', ex);
        }
    }

    async findOneAndRemove(userId: string) {
        try {
            if (!userId) {
                return false
            }
            const data = await this.firebaseModel.findOneAndDelete({ user: userId })
            return data
        } catch (ex) {
            this.logger.error(ex);
            return this.Helper.ResponseFormat(HttpStatus.BAD_REQUEST, '', ex);
        }
    }

    async updateWithMultiOptionsAndFindOptions(optionsfind: any, options: any) {
        try {
            if (!options) {
                return this.Helper.ResponseFormat(HttpStatus.BAD_GATEWAY, '', Helpers.ErrInvalidRequest)

            }

            const updateOptions = await this.firebaseModel.findByIdAndUpdate(optionsfind, { $set: options });
            if (!updateOptions) {
                return this.Helper.ResponseFormat(HttpStatus.BAD_GATEWAY, '', Helpers.ErrUpdate)
            }

            return this.Helper.ResponseFormat(HttpStatus.OK, Helpers.ReponseUpdateFireBase, '')
        } catch (ex) {
            this.logger.error(ex);
            return this.Helper.ResponseFormat(HttpStatus.BAD_GATEWAY, '', Helpers.ErrNotFound)
        }
    }

    async FindByUserIDFromUser(userId: string) {
        try {
            const pattern = { cmd: 'find-users-by-id' };
            if (!userId) {
                return false
            }



            const payload = {
                id: userId
            }

            const data = await firstValueFrom(this.users.send<any>(pattern, payload))

            return data

        } catch (ex) {
            this.logger.error(ex);
            return this.Helper.ResponseFormat(HttpStatus.BAD_GATEWAY, '', Helpers.ErrNotFound)
        }
    }

    async createDeviceId(firebase_token: any, headers: any) {
        try {

            if (!firebase_token) {
                return this.Helper.ResponseFormat(HttpStatus.BAD_REQUEST, '', Helpers.ErrInvalidRequest);
            }

            if (typeof firebase_token != 'object') {
                return this.Helper.ResponseFormat(HttpStatus.BAD_REQUEST, '', Helpers.ErrInvalidRequest);
            }

            if (!firebase_token && !firebase_token.user && typeof firebase_token.user != 'object') {
                return this.Helper.ResponseFormat(HttpStatus.BAD_REQUEST, '', Helpers.ErrInvalidRequest);
            }

            if (!firebase_token && !firebase_token.os) {
                return this.Helper.ResponseFormat(HttpStatus.BAD_REQUEST, '', Helpers.ErrInvalidRequest);
            }

            if (!firebase_token && !firebase_token.token) {
                return this.Helper.ResponseFormat(HttpStatus.BAD_REQUEST, '', Helpers.ErrInvalidRequest);
            }

            if (!firebase_token && !firebase_token.device_id) {
                return this.Helper.ResponseFormat(HttpStatus.BAD_REQUEST, '', Helpers.ErrInvalidRequest);
            }

            if (!firebase_token && !firebase_token.voip_token) {
                return this.Helper.ResponseFormat(HttpStatus.BAD_REQUEST, '', Helpers.ErrInvalidRequest);
            }
            const { user, os, token, device_id, voip_token } = firebase_token ? firebase_token : {}

            let findUsers = await this.FindByUserIDFromUser(user && user.id ? user.id : "")
            if (findUsers && findUsers.status != 200) {
                return this.Helper.ResponseFormat(HttpStatus.BAD_REQUEST, '', Helpers.ErrUsersNotExist);
            }

            findUsers = findUsers && findUsers.one_health_msg ? findUsers.one_health_msg : []

            if (findUsers.length == 0) {
                return this.Helper.ResponseFormat(HttpStatus.BAD_REQUEST, '', Helpers.ErrUsersNotExist);
            }

            const userInfo = findUsers && findUsers[0] ? findUsers[0] : {}
            firebase_token['user'] = userInfo && userInfo._id ? userInfo._id : "";

            await this.updateDeviceUser(userInfo && userInfo._id ? userInfo._id : "", device_id)

            const firebaseInfo = await this.findOneByUserOrToken(userInfo && userInfo._id ? userInfo._id : "", token)
            if (firebaseInfo.length == 0) {
                const newFirebase = await this.create(firebase_token);
                return this.Helper.ResponseFormat(HttpStatus.OK, newFirebase, '');
            }

            const fbase = <any>await this.FindByUserID(userInfo && userInfo._id ? userInfo._id : "")
            if (fbase) {
                if (headers && headers.platform && headers.platform.toLocaleLowerCase() && headers.platform.toLocaleLowerCase() === 'webapp') {

                    firebase_token.token = fbase.token ? fbase.token : '';
                    firebase_token.voip_token = fbase.voip_token ? fbase.voip_token : '';
                    firebase_token.os = fbase.os ? fbase.os : '';

                } else {
                    firebase_token.web_token = fbase.web_token ? fbase.web_token : '';
                }
            }

            let condition = { user: firebase_token.user };
            delete firebase_token.device_id;

            const finalResult = await this.updateWithMultiOptionsAndFindOptions(condition, firebase_token)


            return this.Helper.ResponseFormat(HttpStatus.OK, finalResult, '');
        } catch (ex) {
            this.logger.error(ex);
            return this.Helper.ResponseFormat(HttpStatus.BAD_REQUEST, '', ex);
        }
    }
}


