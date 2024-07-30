import { Document, Model, model, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

export interface IUser extends Document {
    _id: string;
    username: string;
    password: string;
    balance: number;
    status: 'active' | 'inactive';
    comparePassword: (enteredPassword: string) => Promise<boolean>;
}

const userSchema = new Schema<IUser>(
    {
        _id: {
            type: String,
            default: uuidv4,
        },
        username: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
        },
        balance: {
            type: Number,
            default: 100,
        },
        status: {
            type: String,
            enum: ['active', 'inactive'],
            default: 'active',
        },
    },
        { timestamps: true }
);

userSchema.pre<IUser>('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

userSchema.methods.comparePassword = async function (enteredPassword: string): Promise<boolean> {
    return bcrypt.compare(enteredPassword, this.password);
};

const User: Model<IUser> = model<IUser>('User', userSchema);

export default User;
