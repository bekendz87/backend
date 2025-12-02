import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, SchemaTypes, Types } from 'mongoose';

export type DoctorProfileDocument = HydratedDocument<DoctorProfile>;


@Schema()
export class DoctorProfile {
    @Prop()
    doctor_title: string;

    @Prop({ ref: 'speciality', type: SchemaTypes.ObjectId })
    specialities: Types.ObjectId;

    @Prop()
    graduation_year: Number;

    @Prop({ ref: 'images', type: SchemaTypes.ObjectId })
    diploma_img: Types.ObjectId;

    @Prop({ default: '' })
    practice_certificate: string;

    @Prop()
    intro: string;

    @Prop()
    diploma: string;

    @Prop()
    work_at: string;

    @Prop({ ref: 'images', type: SchemaTypes.ObjectId })
    practice_certificate_img: Types.ObjectId;

}



export const DoctorProfileSchema = SchemaFactory.createForClass(DoctorProfile);
