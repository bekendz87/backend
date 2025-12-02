import { Model, SchemaTypes, Types } from "mongoose";
import { Notification } from '../schema/notification.schema';
import { InjectConnection, InjectModel, Schema } from "@nestjs/mongoose";
import { Inject, Injectable, Logger } from "@nestjs/common";
import * as Helper from '@shared/helper/reponseData';
import { LoggerService } from "@shared/logger/logger.services";
import { ProfilesService } from "./profiles.service";
import { FirebaseService } from "../module/firebase.service";
import { PushNotificationService } from "./push_notification.services";
import { ProfilesSocial } from "@common_used/schema/profiles_social.schema";


@Injectable()
export class NotificationService {
    private logger: LoggerService

    @InjectModel('notifications', process.env.DB_SOCIAL || "social_network_oh") private notificationModel: Model<Notification>
    @InjectModel('profiles_social', process.env.DB_SOCIAL || "social_network_oh") private profileSocialModel: Model<ProfilesSocial>
    @Inject() private readonly profileServices: ProfilesService
    @Inject() private readonly firebaseServices: FirebaseService
    @Inject() private readonly pushNotiServices: PushNotificationService

    constructor(

    ) {
        this.logger = new LoggerService()
    }

    async list(req: any) {
        try {
            let option = <any>{}
            const query = req && req.query ? req.query : {}

            if (query) {
                if (query.page) {
                    option.page = query.page
                }

                if (query.limit) {
                    option.limit = query.limit
                }

            }

            let limit = parseInt(option.limit) || 20,
                page = parseInt(option.page) || 1,
                skip = (page * 1) * limit;


            const cond = {
                creator: req && req.user && req.user['id'] ? req.user['id'] : "",
                action: { $nin: ['logout'] },
                status: { $nin: ['sent_fail'] }
            }


            let result = <any>await this.notificationModel.find(cond).sort({ created_time: -1 }).limit(limit).skip(skip);

            if (!result || result.length == 0) {
                return [];
            }

            const updateBadge = <any>result && result[0] ? result[0] : {}

            await this.update((updateBadge && updateBadge._id ? updateBadge._id : ""), { updated_time: new Date(), clearBadge: true });

            const finalResult = result.map((rs: any) => {
                if (rs.type) {
                    rs.type = rs.type.toString();
                }
                return rs;
            })

            return finalResult

        } catch (ex) {
            this.logger.error(ex);
            throw ex
        }



    }

    async update(id: string, options: any) {
        try {

            if (!id) {
                return Helper.ErrInvalidRequest
            }

            if (!options) {
                return Helper.ErrInvalidRequest
            }

            const update = await this.notificationModel.findByIdAndUpdate({ _id: id }, { $set: options })
            if (!update) {
                return Helper.ErrUpdate
            }

            return update
        } catch (ex) {
            this.logger.error(ex);
            throw ex
        }
    }

    async seenNoti(id: string, req: any) {
        try {

            const data = await this.findById(id);
            if (!data) {
                return Helper.ErrNotFound
            }

            if (data && data.clicked && data.clicked == 1) {
                return true;
            }

            if (data && data.creator && req && req.user && req.user.id && req.user.id == data.creator) {
                await this.update(id, { clicked: 1 });
            }

            return true
        } catch (ex) {
            this.logger.error(ex)
            return ex
        }
    }

    async findById(id: string) {
        try {

            const find = await this.notificationModel.findById({ _id: id });
            if (!find) {
                return {};
            }

            return find;
        } catch (ex) {
            this.logger.error(ex)
            return ex
        }
    }

    async countNotSeen(req: any) {
        try {
            let badge: any;

            const newTimeClearBadge = await this.notificationModel.find({
                creator: (req && req.user && req.user.id ? req.user.id : ""),
                clearBadge: true,
                action: { $nin: ['logout'] }
            }).sort({ updated_time: -1 }).limit(1)


            if (!newTimeClearBadge) {
                badge = await this.notificationModel.countDocuments({
                    creator: (req && req.user && req.user.id ? req.user.id : ""),
                    clicked: 0,
                    action: { $nin: ['logout'] }
                })
            } else {
                badge = await this.notificationModel.countDocuments({
                    $and: [
                        { action: { $nin: ['logout'] } },
                        { creator: (req && req.user && req.user.id ? req.user.id : "") },
                        { clicked: 0 },
                        {
                            updated_time: {
                                $gt: new Date(newTimeClearBadge && newTimeClearBadge[0] &&
                                    newTimeClearBadge[0].updated_time ? newTimeClearBadge[0].updated_time : "")
                            }
                        }
                    ]
                })
            }

            return badge
        } catch (ex) {
            this.logger.error(ex)
            throw ex
        }
    }

    async sendNoti(data: any, req: any) {
        try {
            const { title, content, extra, type, action, toId, regesToken } = data || {}

            const noficationInfo = {
                title: title,
                body: content,
                extra: extra,
                type: type,
                post: extra && extra.postId ? extra.postId : "",
                action: action,
                creator: toId,
                actionId: req && req.user && req.user.id ? req.user.id : "",
                sound: data && data.sound ? data.sound : "default",
                regesToken: regesToken || null
            }

            const create = await this.notificationModel.create(noficationInfo)
            if (!create) {
                return Helper.ErrCreateFirebase
            }

            return create
        } catch (ex) {
            this.logger.error(ex)
            return ex
        }
    }

    async pushNoti(data: any) {
        try {
            if (!data) {
                return false
            }

            const profile = await this.profileServices.FindByIDWithoutActive(data && data.creator ? data.creator : "")
            if (!profile) {
                return false
            }

            if (profile && profile.app_profile) {
                const firebaseData = <any>await this.firebaseServices.FindByUserID(profile && profile.app_profile ? profile.app_profile : "")
                const notiData = {
                    title: data && data.title ? data.title : "",
                    body: data && data.body ? data.body : "",
                    extra: data && data.extra ? data.extra : "",
                    type: data && data.type ? data.type : "",
                    os: firebaseData && firebaseData.os ? firebaseData.os : "ios",
                    sound: data && data.sound ? data.sound : "",
                    badge: data && data.badge ? data.badge : "",
                    appType: profile && profile.type ? profile.type : "",
                    firebaseToken: (firebaseData && firebaseData.token ? firebaseData.token : "") || (data && data.regesToken ? data.regesToken : "")
                }

                const result = await this.pushNotiServices.PushNotification(notiData);

                this.logger.log(`Reponse Notifications : ${JSON.stringify(result)}`)

                if (!result) {
                    await this.update(data && data._id ? data._id : "", { status: 'sent_fail' })
                    return false
                } else if (result) {
                    await this.update(data && data._id ? data._id : "", { status: 'sent' })
                    return true
                } else if (result.results && result.results[0] && result.results[0].error && result.results[0].error == "NotRegistered") {
                    await this.firebaseServices.findOneAndRemove(profile && profile.app_profile ? profile.app_profile : "");
                    await this.firebaseServices.create({
                        "user": profile && profile.app_profile ? profile.app_profile : "",
                        "token": (firebaseData && firebaseData.token ? firebaseData.token : "") || (data && data.regesToken ? data.regesToken : ""),
                        "os": firebaseData && firebaseData.os ? firebaseData.os : "ios",
                        "voip_token": firebaseData && firebaseData.voip_token ? firebaseData.voip_token : "",
                        "web_token": firebaseData && firebaseData.web_token ? firebaseData.web_token : "",
                        "modified_time": new Date()
                    })

                    const pushNotiAggain = await this.pushNotiServices.PushNotification(notiData);
                    if (!pushNotiAggain) {
                        await this.update(data && data._id ? data._id : "", { status: 'sent_fail' })
                        return false
                    } else if (result.success && result.success == 1) {
                        await this.update(data && data._id ? data._id : "", { status: 'sent' })
                        return true
                    } else {
                        await this.update(data && data._id ? data._id : "", { status: 'sent_fail' })
                        return false
                    }
                } else {
                    await this.update(data && data._id ? data._id : "", { status: 'sent_fail' })
                    return false
                }


            }


        } catch (ex) {
            this.logger.error(ex)
            return ex
        }
    }

    async createNoti(currentUser: any, toId: string, object: any, type: number, content: string, action: string, title: string, schedule: Boolean) {
        try {
            let contentNoti = '';

            if (currentUser && content) {
                contentNoti = currentUser.type && currentUser.type == 2 ? 'Bác sĩ ' : '';
                if (currentUser.first_name && currentUser.last_name) {
                    contentNoti += currentUser.last_name + ' ' + currentUser.first_name + ' ';
                }

            }

            contentNoti += content;

            const noficationInfo = {
                title: title || contentNoti,
                body: title ? contentNoti : '',
                extra: object,
                type: type,
                post: (object && object.postId) || null,
                action: action || 'like',
                creator: toId,
                actionId: (currentUser && currentUser._id) || null,
                schedule: schedule || false
            };
            return await this.notificationModel.create(noficationInfo);
        } catch (ex) {
            this.logger.error(ex)
            return ex
        }

    }

    async updateProfile(id: string, update: any) {
        try {
            if (!id) {
                return false
            }

            if (!update) {
                return false
            }

            const checkProfile = await this.profileSocialModel.findOne({ app_profile: id })
            if (!checkProfile) {
                return false
            }

            const data = await this.profileSocialModel.findByIdAndUpdate({ app_profile: id }, { $set: update })

            return data

        } catch (ex) {
            this.logger.error(ex)
            return ex
        }
    }
}
