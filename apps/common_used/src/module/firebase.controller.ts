import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    Req,
    Inject,
    HttpStatus,
    Logger,
    Put
} from '@nestjs/common';

import { FirebaseService } from './firebase.service'
import * as Helpers from '@shared/helper/reponseData';
import { CreateFirebaseDTO, CreateDeviceDTO, ParamsUpdate } from '../dto/firebase.dto'
import { MessagePattern } from '@nestjs/microservices';
import { Helper } from '@shared/helper/helper.service';
import { LoggerService } from '@shared/logger/logger.services';

@Controller('firebase-token')
export class FirebaseController {
    private Helper: Helper
    private logger: LoggerService

    constructor(
        private firebaseService: FirebaseService,
    ) {
        this.logger = new LoggerService()
        this.Helper = new Helper()
    }

    @MessagePattern({ cmd: 'firebase-list-all' })
    async getListAll() {
        try {
            const data = await this.firebaseService.getAll();
            return this.Helper.ResponseFormat(HttpStatus.OK, data, '');
        } catch (ex) {
            this.logger.error(ex);
            return this.Helper.ResponseFormat(HttpStatus.BAD_REQUEST, '', ex);
        }
    }


    @MessagePattern({ cmd: 'firebase-create' })
    async create(_: CreateFirebaseDTO) {
        try {
            const data = this.firebaseService.create(_);
            return this.Helper.ResponseFormat(HttpStatus.OK, data, '');
        } catch (ex) {
            this.logger.error(ex);
            return this.Helper.ResponseFormat(HttpStatus.BAD_REQUEST, '', ex);
        }
    }

    @MessagePattern({ cmd: 'firebase-update-device-id' })
    async updateDeviceId(_: any) {
        try {
            const { body } = _
            const data = await this.firebaseService.updateDeviceId(body);
            return this.Helper.ResponseFormat(HttpStatus.OK, data, '');
        } catch (ex) {
            this.logger.error(ex);
            return this.Helper.ResponseFormat(HttpStatus.BAD_REQUEST, '', ex);
        }
    }

    @MessagePattern({ cmd: 'firebase-update' })
    async updateFirebase(_: any) {
        try {
            const { body, id } = _
            const data = this.firebaseService.updateWithMultiOptions(id, body);
            return this.Helper.ResponseFormat(HttpStatus.OK, data, '');
        } catch (ex) {
            this.logger.error(ex);
            return this.Helper.ResponseFormat(HttpStatus.BAD_REQUEST, '', ex);
        }
    }

    @MessagePattern({ cmd: 'firebase-create-device-id' })
    async createDeviceId(_: any) {
        try {
            const { firebase_token ,headers} = _ ? _ : {}
            const data = await this.firebaseService.createDeviceId(firebase_token,headers);
            return this.Helper.ResponseFormat(HttpStatus.OK, data, '');
        } catch (ex) {
            this.logger.error(ex);
            return this.Helper.ResponseFormat(HttpStatus.BAD_REQUEST, '', ex);
        }
    }
}