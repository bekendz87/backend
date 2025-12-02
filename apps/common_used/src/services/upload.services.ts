import { Inject, Injectable, Logger } from '@nestjs/common';
import { LoggerService } from '@shared/logger/logger.services';
import Redis from 'ioredis'
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { FirebaseService } from '../module/firebase.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Images } from '@common_used/schema/images.schema';
import { Repository } from 'typeorm';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class UploadService {
    private logger: LoggerService;
    private redis: Redis;
    constructor(
        @Inject() private readonly firebaseServices: FirebaseService,
        @InjectModel(Images.name, process.env.DB_NAME || "OneHealthDB") private imagesModel: Model<Images>,
        @Inject('users') private readonly users: ClientProxy,
    ) {
        this.logger = new LoggerService();
        this.redis = new Redis()
    }

    async create(image: any, pathFolder: string, pathImage: string, urlImage: string, bitmap: Buffer) {
        try {
            if (!image) {
                return false
            }

            if (!pathFolder) {
                return false
            }

            if (!pathImage) {
                return false
            }

            if (!urlImage) {
                return false
            }

            if (!bitmap) {
                return false
            }

            if (image && image.type == 1) {
                if (!existsSync(pathFolder)) {
                    mkdirSync(pathFolder);
                }

                const checkUsers = <any>await this.firebaseServices.FindByUserID(image &&
                    image.user &&
                    image.user.id ? image.user.id : ""
                )

                if (!checkUsers || checkUsers.length == 0) {
                    return false
                }

                writeFileSync(pathImage, bitmap);

                image.url = `${urlImage}?${new Date().getTime()}`
                image.physical_path = pathImage;

                const create = await <any>this.imagesModel.create(image)
                if (!create) {
                    return create
                }

                let imageInfo = <any>{
                    ...create
                }

                imageInfo.url = urlImage + imageInfo.url
                imageInfo.physical_path = pathImage + imageInfo.physical_path

                await this.updateUsers(image && image.user && image.user.id ? image.user.id : "", { avatar: create._id })

                return imageInfo
            } else {
                return false
            }

        } catch (ex) {
            this.logger.error(ex)
            return ex
        }
    }

    async updateUsers(userId: string, options: any) {
        try {
            const pattern = { cmd: 'find-users-by-id-and-update-options' };
            if (!userId) {
                return false
            }

            if (!options) {
                return false
            }

            const payload = {
                id: userId,
                options: options
            }

            const data = await firstValueFrom(this.users.send<any>(pattern, payload))

            return data



        } catch (ex) {
            this.logger.error(ex)
            return ex
        }
    }

    async findOneById(id: string) {
        try {
            if (!id) {
                return false
            }
            
            const data = await this.imagesModel.findOne({ _id: id })

            return data
        } catch (ex) {
            this.logger.error(ex)
            return ex
        }
    }
}
