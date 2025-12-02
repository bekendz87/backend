import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, ObjectId, SchemaTypes, Types } from 'mongoose';


export type HisPointAccountDocument = HydratedDocument<HisPointAccount>;


@Schema({
    collection: "his_point_account",
    timestamps: {
        createdAt: 'created_time',
        updatedAt: 'modified_time',
    },
})
export class HisPointAccount {
    @Prop({ ref: 'users', type: SchemaTypes.ObjectId })
    user: ObjectId;

    @Prop()
    token: string;

    @Prop()
    voip_token: string;

    @Prop()
    web_token: string;

    @Prop()
    os: string;

    @Prop()
    deleted: Number;

}



export const HisPointAccountSchema = SchemaFactory.createForClass(HisPointAccount);
