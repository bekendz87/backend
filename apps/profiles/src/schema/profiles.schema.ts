import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, SchemaTypes, Types } from 'mongoose';
import { Helper } from '@shared/helper/helper.service';
export type ProfilesDocument = HydratedDocument<Profiles>;

const Helpers = new Helper()

export class objectProfiles {
    @Prop({ default: '' })
    patient_code: String

    @Prop({ default: '' })
    phone: String

    @Prop({ default: '' })
    birthday: Date

    @Prop({ default: '' })
    identity_num: String

    @Prop({ default: '' })
    sex: String

    @Prop({ default: '' })
    name: String

    @Prop({ default: Date.now() })
    modified_time: Date
}

export class objectViewBADT {
    @Prop({ default: 0 })
    ignore_num: Number

    @Prop({ default: false })
    is_view: Boolean
}


export class objectLocation {
    location: {
        province: {
            type: Object
        },
        district: {
            type: Object
        },
        ward: {
            type: Object
        },
        address: {
            type: String,
            default: ""
        }
    }
}

@Schema()
export class Profiles {
    @Prop({ type: SchemaTypes.ObjectId, ref: 'users', required: true })
    user: string;

    @Prop({ default: true })
    active: Boolean

    @Prop({ enum: ['male', 'female'], required: true })
    sex: string

    @Prop({ required: true })
    birthday: Date

    @Prop({ default: "" })
    first_name: string

    @Prop({ default: "" })
    last_name: string

    @Prop()
    names: Array<any>

    @Prop()
    phones: Array<any>

    @Prop()
    location: objectLocation

    @Prop({ default: Date.now() })
    created_time: Date

    @Prop({ default: '' })
    num_insurance: string

    @Prop({ default: Date.now() })
    modified_time: Date


    @Prop({
        enum: ["owner", "husband", "wife", "mother",
            "father", "son", "daughter",
            "sister", "younger_sister", "brother",
            "younger_brother", "grandmother", "grandfather",
            "uncle", "aunt", "other"]
    })
    relationship: string

    @Prop({ default: "" })
    gurdian_name: string

    @Prop({ default: "" })
    mother_name: string

    @Prop({ default: "" })
    father_name: string

    @Prop({ default: "" })
    mother_phone: string

    @Prop({ default: "" })
    father_phone: string

    @Prop({ default: false })
    deleted: Boolean

    @Prop({ default: "" })
    name: string

    @Prop({ default: "" })
    phone: string

    @Prop()
    nhi_dong: objectProfiles

    @Prop()
    hong_duc2: objectProfiles

    @Prop()
    his_profile: objectProfiles

    @Prop()
    drkhoa: objectProfiles

    @Prop({ default: "" })
    identity_num: string

    @Prop({ default: "" })
    code: string

    @Prop()
    seq: Number

    @Prop({ type: Object })
    view_benh_an_dt: {
        hong_duc: objectViewBADT,
        hong_duc2: objectViewBADT,
        nhi_dong: objectViewBADT,
        drkhoa: objectViewBADT

    }

    @Prop({ type: SchemaTypes.ObjectId, ref: 'users', required: true })
    current_holder: string;

    @Prop({ default: Date.now() })
    holder_modified_time: Date
}

export const ProfilesSchema = SchemaFactory.createForClass(Profiles);


ProfilesSchema.pre("updateOne", function (next) {
    let self = <any>this;
    let setCond = self._update["$set"];

    if (setCond && setCond.birthday) {
        setCond.birthday = CheckValidDate(setCond.birthday);
    }


    self._update["$set"] = setCond;
    next();
});

ProfilesSchema.pre("save", async function (next) {

    let self = <any>this;
    if (self.isNew) {
        const suc = await self.constructor.findOne({
            user: self.user,
            first_name: self.first_name,
            last_name: self.last_name,
            relationship: self.relationship,
            sex: self.sex,
            birthday: self.birthday,
            phone: self.phone,
            deleted: { $ne: true },
            active: true
        })

        if (suc && suc._id) {
            return next();
        } else {
            const { seq, code, codeFull } = await Helpers.genCode(Profiles.name)

            self.code = codeFull;
            self.seq = seq;
            next();

        }
    } else {
        next();
    }
});

ProfilesSchema.pre("save", function (next) {
    let self = this;

    if (self && self.birthday) {
        self.birthday = CheckValidDate(self.birthday);
    }

    next();
});

ProfilesSchema.pre("findOneAndUpdate", function (next) {
    let self = <any>this;

    if (self && self.birthday) {
        self.birthday = CheckValidDate(self.birthday);
    }

    next();
});

function CheckValidDate(dateInput: Date) {
    try {
        let time = <any>new Date(dateInput);

        if (parseInt(time.getFullYear()) < 1975) {
            time = new Date(time.setHours(7));
        }

        return time.toISOString();
    } catch (ex) {
        return ex
    }
}
