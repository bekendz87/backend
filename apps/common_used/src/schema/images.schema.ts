import { Prop, SchemaFactory, Schema } from '@nestjs/mongoose';
import { HydratedDocument, SchemaTypes, Types } from 'mongoose';


export type ImagesDocument = HydratedDocument<Images>;

@Schema({
    collection: "images",
    timestamps: {
        createdAt: 'created_time',
        updatedAt: 'modified_time',
    },
})
export class Images {
    @Prop({ required: true })
    url: string

    @Prop({ required: true })
    physical_path: string

    @Prop({ required: true })
    type: Number

    @Prop({ default: 0 })
    deleted: Number

    @Prop({ required: true })
    newType: string
}

export const ImagesSchema = SchemaFactory.createForClass(Images);


