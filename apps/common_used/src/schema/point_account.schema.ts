import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, ObjectId, SchemaTypes, Types } from 'mongoose';

export type Point_AccountDocument = HydratedDocument<Point_Account>;

@Schema({
    collection: "point_account",
    timestamps: {
        createdAt: 'created_time',
        updatedAt: 'updated_time',
    },
})
export class Point_Account {
    @Prop({ ref: 'users', type: SchemaTypes.ObjectId })
    user: ObjectId;

    @Prop({ default: 0 })
    balance: number;

    @Prop({ default: false })
    delete: Boolean
}

export const Point_AccountSchema = SchemaFactory.createForClass(Point_Account);