import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, SchemaTypes, Types } from 'mongoose';

export type SocialLoginDocument = HydratedDocument<SocialLogin>;


@Schema()
export class SocialLogin {
    @Prop()
    user_id: string;

    @Prop()
    name: string

    @Prop()
    email: string

}



export const SocialLoginSchema = SchemaFactory.createForClass(SocialLogin);
