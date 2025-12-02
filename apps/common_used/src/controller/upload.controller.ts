import { Controller, Inject, Logger, Get, HttpStatus, HttpCode } from '@nestjs/common';
import { ClientProxy, MessagePattern } from '@nestjs/microservices';
import { compareAsc, format } from "date-fns";
import { isObjectIdOrHexString } from 'mongoose';
import { Helper } from '@shared/helper/helper.service';
import { LoggerService } from '@shared/logger/logger.services';
import * as Helpers from '@shared/helper/reponseData';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { FirebaseService } from '@common_used/module/firebase.service';
import { UploadService } from '@common_used/services/upload.services';

@Controller()
export class UploadController {

    private logger: LoggerService;
    constructor(
        @Inject() private readonly Helper: Helper,

        @Inject() private readonly uploadServices: UploadService

    ) {
        this.logger = new LoggerService();
    }


    @MessagePattern({ cmd: 'upload-images' })
    async uploadImage(physical_path: string, folder: string, separateFolder: string, image: any, subfolder: string) {
        try {
            let filename = "test.png"
            if (!physical_path) {
                return this.Helper.ResponseFormat(HttpStatus.BAD_REQUEST, {}, Helpers.ErrPathUpload)
            }

            if (!folder) {
                return this.Helper.ResponseFormat(HttpStatus.BAD_REQUEST, {}, Helpers.ErrPathUpload)
            }

            if (!separateFolder) {
                return this.Helper.ResponseFormat(HttpStatus.BAD_REQUEST, {}, Helpers.ErrPathServer)
            }

            if (!image) {
                return this.Helper.ResponseFormat(HttpStatus.BAD_REQUEST, {}, Helpers.ErrFilename)
            }

            if (!existsSync(physical_path)) {
                return this.Helper.ResponseFormat(HttpStatus.BAD_REQUEST, {}, Helpers.ErrPathServer)
            }

            const pathFolder = physical_path + folder
            let data = image.data;
            data = data.replace("data:image/png;base64,", "");
            data = data.replace("data:image/jpeg;base64,", "");
            const bitmap = new Buffer(data, "base64");

            if (!existsSync(pathFolder)) {
                mkdirSync(pathFolder);
            }

            const urlImage = `${process.env.URL_IMAGE}${folder}/${subfolder}/${filename}`
            const pathImage = physical_path + folder + separateFolder + subfolder + separateFolder + filename;

            const uploadImg = await this.uploadServices.create(
                image,
                pathFolder + separateFolder + subfolder,
                urlImage, pathImage, bitmap,
            )

            if (!uploadImg || uploadImg.length == 0) {
                return this.Helper.ResponseFormat(HttpStatus.BAD_REQUEST, {}, Helpers.ErrUploadFile)
            }

            return this.Helper.ResponseFormat(HttpStatus.OK, uploadImg, {})

        } catch (ex) {
            this.logger.error(ex)
            return this.Helper.ResponseFormat(HttpStatus.BAD_REQUEST, {}, ex && ex.message ? ex.message : "")
        }
    }




}
