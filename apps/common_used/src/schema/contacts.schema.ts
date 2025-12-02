import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Model, ObjectId, SchemaTypes, Types } from 'mongoose';
import { ProfilesSocialSchema, ProfilesSocial } from "./profiles_social.schema";
import { Repository } from "typeorm";

const profileSocialModel = Model<ProfilesSocial>

export type ContactsDocument = HydratedDocument<Contacts>;


@Schema()
export class Contacts {
    @Prop({ ref: 'profiles_social', type: SchemaTypes.ObjectId })
    profileId: ObjectId;

    @Prop({ default: [] })
    phones_profile: Array<any>;

    @Prop({ default: [] })
    phones_suggest: Array<any>;

    @Prop({ default: [] })
    phones_autoFollow: Array<any>;

    @Prop({ default: [] })
    phones: Array<any>;

    @Prop({ default: [] })
    new_phones: Array<any>;

    @Prop({ default: 0 })
    deleted: Number;

    @Prop({ default: Date.now() })
    created_time: Date;

    @Prop({ default: Date.now() })
    updated_time: Date;
}

export const ContactsSchema = SchemaFactory.createForClass(Contacts);

ContactsSchema.pre("save", async function (next) {
    let doc = <any>this;
    if (doc.phones_profile) {
        doc.phones_autoFollow = doc.phones_autoFollow ? doc.phones_autoFollow : [];

        const currentProfile = await profileSocialModel.findById({ _id: doc && doc.profileId ? doc.profileId : "" })

        doc.phones_profile.forEach(async (element: any, index: number) => {
            let pf = await profileSocialModel.findOne({ username: element.username })

            if (pf.active == 1) {
                const checkContact = await doc.constructor.findOne({ profileId: pf._id })
                if (checkContact) {
                    checkContact.phones_profile.forEach(async (e: any) => {
                        if (e.username == currentProfile.username && doc.phones_autoFollow.indexOf(pf.username) < 0) {
                            await profileSocialModel.findOneAndUpdate(
                                { _id: doc.profileId },
                                { $addToSet: { following: pf._id } }
                            )

                            await doc.constructor.update({ _id: doc._id }, { $addToSet: { phones_autoFollow: pf.username } })

                        }
                    });

                    if (checkContact.phones_autoFollow && checkContact.phones_autoFollow.indexOf(currentProfile.username) < 0) {
                        await profileSocialModel.findOneAndUpdate(
                            { _id: pf._id },
                            { $addToSet: { following: doc.profileId } }
                        )

                        await doc.constructor.update({ _id: checkContact._id }, { $addToSet: { phones_autoFollow: currentProfile.username } })

                    }
                }
            }
        });
        next();
    } else {
        next();
    }
})

ContactsSchema.pre("save", function (next) {
    let doc = this;
    if (doc.phones_suggest) {

        let results = <any>[],
            i = 0,
            length = doc.phones_suggest.length;

        while (length--) {
            i = length + 1;
            const contact = doc && doc.phones_suggest && doc.phones_suggest[i] ? doc.phones_suggest[i] : "";

            if (contact) {

                results.forEach((e: any, index: number) => {
                    if (e && e.phones.equals(contact.phones)) {
                        results.splice(index, 1);
                    }
                })

                results.push(contact);

                doc.phones_suggest.splice(i, 1);
            }
        }

        doc.phones_suggest = results;

        next();
    } else {
        next();
    }
});