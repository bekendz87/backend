import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, ObjectId, SchemaTypes, Types } from 'mongoose';


export type FirebaseTokenDocument = HydratedDocument<FirebaseToken>;


@Schema({
    collection: "firebase_token",
    timestamps: {
        createdAt: 'created_time',
        updatedAt: 'modified_time',
    },
})
export class FirebaseToken {
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



export const FirebaseTokenSchema = SchemaFactory.createForClass(FirebaseToken);
