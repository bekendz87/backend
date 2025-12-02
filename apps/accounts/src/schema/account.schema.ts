import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, ObjectId, SchemaTypes, Types } from 'mongoose';

export type AccountsDocument = HydratedDocument<Accounts>;


@Schema()
export class Accounts {
    @Prop({ ref: 'users', type: SchemaTypes.ObjectId })
    user: ObjectId;

    @Prop({
        default: 0,
        validate: {
            validator: function (value: number) {
                if (value < 0) {
                    return false;
                }

                return true

            },
            message: 'Số dư đang âm và không được phép thanh toán khi số dư đang âm !',
        },
    })
    balance: Number

    @Prop({ default: 0 })
    creditBeforeChangeVND: Number

    @Prop({ default: Date.now() })
    timeChangeCreditToVND: Date

    @Prop({ default: 0 })
    balanceBeforeChangePointToVND: Number

    @Prop({ default: false })
    isChangePointToVND: Boolean

    @Prop({ default: false })
    isChangePoint: Boolean

    @Prop({ default: false })
    isChangeVND: Boolean

    @Prop({ default: 0 })
    creditBeforeChangePoint: Number

    @Prop({ default: Date.now() })
    timeChangeCreditToPoint: Date

    @Prop({ default: 0 })
    point: Number

    @Prop({ default: Date.now() })
    created_time: Date

    @Prop({ default: Date.now() })
    modified_time: Date

    @Prop({ default: 0 })
    deleted: Number

    // @Prop({ type: SchemaTypes.ObjectId, ref: 'payment_his' })
    // current_payment: string

    // @Prop({ type: SchemaTypes.ObjectId, ref: 'payment_his' })
    // pendingPayments: Array<any>
}

export const AccountsSchema = SchemaFactory.createForClass(Accounts);



