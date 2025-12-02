import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, SchemaType, SchemaTypes, Types } from 'mongoose';
import { StatusEnum, ActionEnum } from '../constans/notification.constans';
import { differenceInMinutes } from 'date-fns';
import { Inject } from '@nestjs/common';
import { NotificationService } from '@common_used/services/notification.service';


const NotiSever = new NotificationService()
export type NotificationDocument = HydratedDocument<Notification>;

@Schema({ collection: "notifications" })
export class Notification {
    @Prop({ type: SchemaTypes.ObjectId, required: true, ref: 'users' })
    creator: Types.ObjectId;

    @Prop({ type: SchemaTypes.ObjectId })
    post: Types.ObjectId;

    @Prop({ type: SchemaTypes.ObjectId })
    media: Types.ObjectId

    @Prop({ type: SchemaTypes.ObjectId })
    comment: Types.ObjectId

    @Prop({ ref: '' })
    title: string

    @Prop({ type: SchemaTypes.ObjectId })
    target: Types.ObjectId

    @Prop({ type: SchemaTypes.ObjectId })
    actionId: Types.ObjectId

    @Prop()
    body: string

    @Prop()
    type: Number

    @Prop({ type: Object })
    extra: Object

    @Prop({ enum: StatusEnum, default: 'new' })
    status: string

    @Prop({ enum: ActionEnum, required: true })
    action: string

    @Prop({ type: SchemaTypes.ObjectId })
    like: Types.ObjectId

    @Prop({ ref: Date.now })
    created_time: Date

    @Prop({ default: 0 })
    deleted: Number

    @Prop({ default: 0 })
    clicked: Number

    @Prop()
    badge: string

    @Prop({ ref: Date.now })
    updated_time: Date

    @Prop()
    clearBadge: Boolean

    @Prop()
    sound: string

    @Prop()
    regesToken: string

    @Prop({ default: false })
    schedule: Boolean
}


export const NotificationSchema = SchemaFactory.createForClass(Notification);

NotificationSchema.pre('save', function (next) {
    let self = <any>this;

    if (!self['target']) {
        self['target'] = (self.extra && self.extra.postId ? self.extra.postId : "") ||
            (self.extra && self.extra.profileId ? self.extra.profileId : "") ||
            self.commentId || self.creator ? self.creator : "";
    }

    next();
});

NotificationSchema.post('save', async (doc: any, next) => {
    if (doc.action == 'logout') {
        next();
    } else {
        const newTimeClearBadge = await doc.constructor
            .find({ creator: doc.creator, clearBadge: true, action: { $nin: ['logout'] } })
            .sort({ updated_time: -1 })
            .limit(1)
            .exec();

        let badge = 0;

        if (newTimeClearBadge && newTimeClearBadge.length) {
            badge = await doc.constructor
                .count({
                    $and: [
                        { action: { $nin: ['logout'] } },
                        { creator: doc.creator },
                        { clicked: 0 },
                        { updated_time: { $gt: newTimeClearBadge && newTimeClearBadge[0] && newTimeClearBadge[0].updated_time ? newTimeClearBadge[0].updated_time : Date.now() } }]
                }).exec();
        } else {
            badge = await doc.constructor
                .count({
                    creator: doc.creator,
                    clicked: 0,
                    action: { $nin: ['logout'] }
                }).exec();
        }

        await doc.constructor.update(
            { _id: doc._id },
            { $set: { badge: badge.toString(), 'extra.badge': badge.toString() } },
            { new: true }
        );

        doc.extra = doc.extra || {};
        doc.extra.badge = doc.badge = badge.toString();
        let extra = doc.extra;
        let propId = '';

        for (var key in extra) {

            if (extra.hasOwnProperty(key)) {
                if (key == 'postId') {
                    propId = extra[key];
                }

                if (key == 'profileId') {
                    propId = extra[key];
                }
            }
        }

        if (propId && doc.action !== 'comment' && !doc.schedule && doc.action !== 'birthday') {

            let data = await doc.constructor
                .find({
                    type: doc.type,
                    action: doc.action,
                    creator: doc.creator,
                    actionId: doc.actionId,
                    target: doc.target
                }).sort({ created_time: -1 }).limit(10).exec();

            if (data.length == 0 || data.length == 1) {

                await NotiSever.pushNoti(doc);

            } else {
                let sentNotiIntime = true;
                data.forEach((element: any) => {
                    if (element && element.status == 'sent') {

                        if (differenceInMinutes(new Date(), new Date(element.created_time)) < 60) {
                            sentNotiIntime = false;
                        }

                    }
                }, this);

                if (sentNotiIntime) {
                    await NotiSever.pushNoti(doc);
                }
            }
        } else {
            await NotiSever.pushNoti(doc);
        }

        next();
    }


});



