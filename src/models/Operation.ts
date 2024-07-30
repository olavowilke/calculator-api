import mongoose, { Document, Model, Schema } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface IOperation extends Document {
    _id: string;
    type: 'addition' | 'subtraction' | 'multiplication' | 'division' | 'square_root' | 'random_string';
    cost: number;
}

const operationSchema: Schema = new Schema<IOperation>(
    {
        _id: {
            type: String,
            default: uuidv4,
        },
        type: {
            type: String,
            required: true,
            enum: ['addition', 'subtraction', 'multiplication', 'division', 'square_root', 'random_string'],
        },
        cost: {
            type: Number,
            required: true,
        },
    },
        { timestamps: true }
);

const Operation: Model<IOperation> = mongoose.model<IOperation>('Operation', operationSchema);

export default Operation;
