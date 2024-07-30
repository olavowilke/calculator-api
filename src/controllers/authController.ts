import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';

export const register = async (req: Request, res: Response): Promise<void> => {
    const { username, password } = req.body;
    try {
        const user = new User({ username, password });
        await user.save();
        res.status(201).json({ success: true, message: 'User registered successfully' });
    } catch (err: any) {
        res.status(400).json({ success: false, message: err.message });
    }
    return;
};

export const login = async (req: Request, res: Response): Promise<void> => {
    const { username, password } = req.body;
    try {
        const user: IUser | null = await User.findOne({ username });

        if (!user) {
            res.status(404).json({ success: false, message: 'Invalid credentials' });
            return;
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            res.status(400).json({ success: false, message: 'Invalid credentials' });
            return;
        }

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET as string, { expiresIn: '1h' });

        res.status(200).json({ success: true, token: `Bearer ${token}`, balance: user.balance });
    } catch (err: any) {
        res.status(500).json({ success: false, message: err.message });
    }
    return;
};
