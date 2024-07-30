import mongoose, { Document, Model, Schema } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface IRecord extends Document {
    _id: string;
    operation_id: string;
    user_id: string;
    amount: number;
    user_balance: number;
    operation_response: string;
    date: Date;
    deleted: boolean;
}

const recordSchema: Schema<IRecord> = new Schema(
    {
        _id: {
            type: String,
            default: uuidv4,
        },
        operation_id: {
            type: String,
            ref: 'Operation',
            required: true,
        },
        user_id: {
            type: String,
            ref: 'User',
            required: true,
        },
        amount: {
            type: Number,
            required: true,
            default: 1,
        },
        user_balance: {
            type: Number,
            required: true,
        },
        operation_response: {
            type: String,
            required: true,
        },
        date: {
            type: Date,
            default: Date.now,
        },
        deleted: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

const Record: Model<IRecord> = mongoose.model<IRecord>('Record', recordSchema);

export default Record;
