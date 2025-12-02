import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, ObjectId, SchemaTypes, Types } from 'mongoose';
import { Helper } from "@shared/helper/helper.service";
import underscodere from 'underscore'


export type ProfilesSocialDocument = HydratedDocument<ProfilesSocial>;

const Helpers = new Helper()



@Schema({
    collection:'profiles_social'
})
export class ProfilesSocial {
    @Prop({ default: '' })
    first_name: string

    @Prop({ default: '' })
    last_name: string

    @Prop({ default: '' })
    username: string

    @Prop({ type: Object })
    avatar: Object

    @Prop({ type: Array, default: [] })
    following: ObjectId

    @Prop({ default: 1 })
    active: Number

    @Prop({ default: [] })
    keywords: Array<any>

    @Prop({ default: [] })
    removeDiacriticsArray: Array<any>

    @Prop({ default: '' })
    removeDiacriticsFirstname: string

    @Prop({ default: '' })
    removeDiacriticsLastname: string

    @Prop({ default: 0 })
    deleted: Number

    @Prop({ required: true, type: SchemaTypes.ObjectId })
    app_profile: ObjectId

    @Prop({ default: '' })
    facebook_token: string

    @Prop({ default: '' })
    google_token: string

    @Prop({ default: '' })
    token: string

    @Prop({})
    is_login: Number

    @Prop({})
    is_online: Number

    @Prop({ default: Date.now() })
    created_time: Date

    @Prop({ default: Date.now() })
    modified_time: Date

    @Prop({})
    type: Number
}

export const ProfilesSocialSchema = SchemaFactory.createForClass(ProfilesSocial);

ProfilesSocialSchema.pre("save", function (next) {
    let self = <any>this;
    if (self.first_name || self.last_name) {
        updateSearchName(self);
        next();
    } else {
        next();
    }
});

ProfilesSocialSchema.pre("updateOne", function (next) {
    let self = <any>this;
    if (self.first_name || self.last_name) {
        updateSearchName(self);
        next();
    } else {
        next();
    }
});

ProfilesSocialSchema.pre('findOneAndUpdate', function (next) {
    let self = <any>this;
    if (self.first_name || self.last_name) {
        updateSearchName(self);
        next();
    } else {
        next();
    }
});


function updateSearchName(self: any) {
    try {
        let first_name = (self.first_name && self.first_name.toLowerCase()) || '';
        let last_name = (self.last_name && self.last_name.toLowerCase()) || '';

        let keywords: any[] = []
        let keys: any[] = []

        self.removeDiacriticsFirstname = Helpers.removeDiacritics(first_name) || '';
        self.removeDiacriticsLastname = Helpers.removeDiacritics(last_name) || '';


        const removeDiacriticsArray = [
            ...self.removeDiacriticsFirstname.split(' '),
            ...self.removeDiacriticsLastname.split(' ')
        ];

        keywords.push(...first_name.split(' '))
        keywords.push(...last_name.split(' '))

        keys.push(Helpers.revestTagname(keywords))
        keys.push(Helpers.revestTagname(removeDiacriticsArray))

        self.keywords = underscodere.uniq([...keywords, ...keys]);
        self.removeDiacriticsArray = removeDiacriticsArray;

    } catch (ex) {
        console.log(ex);
    }

}