import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from 'mongoose';

export type VerifyCodeDocument = HydratedDocument<VerifyCode>;


@Schema({
    collection: "verify_code",
})
export class VerifyCode {
    @Prop({ required: true })
    phone: string;

    @Prop({ required: true })
    pin_code: string;

    @Prop({ default: Date.now(), required: true })
    expire: Date;

    @Prop({ default: Date.now(), required: true })
    created_time: Date;

    @Prop({ default: 0 })
    deleted: Number;

    @Prop({ default: 'wait_verify', enum: ['wait_verify', 'verified', 'expired'] })
    status: string;

    @Prop({ default: true })
    first_time: Boolean;

    @Prop({})
    verify_time: Date;
}

export const VerifyCodeSchema = SchemaFactory.createForClass(VerifyCode);