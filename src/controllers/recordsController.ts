import { Request, Response } from 'express';
import axios from 'axios';
import Record, { IRecord } from '../models/Record';
import Operation, { IOperation } from '../models/Operation';
import User, { IUser } from '../models/User';

interface AuthenticatedRequest extends Request {
    user?: IUser;
}

export const createRecord = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { operationType, param1, param2 } = req.body;
    const user_id = req.user?._id;

    try {
        const operation = await Operation.findOne({ type: operationType }) as IOperation;

        if (!operation) {
            res.status(404).json({ success: false, message: 'Operation not found' });
            return;
        }

        const user = await User.findById(user_id) as IUser;

        if (!user) {
            res.status(404).json({ success: false, message: 'User not found' });
            return;
        }

        if (user.balance < operation.cost) {
            res.status(400).json({ success: false, message: 'Insufficient balance' });
            return;
        }

        let operationResponse: number | string;
        switch (operationType) {
            case 'addition':
                operationResponse = param1 + param2;
                break;
            case 'subtraction':
                operationResponse = param1 - param2;
                break;
            case 'multiplication':
                operationResponse = param1 * param2;
                break;
            case 'division':
                if (param2 === 0) {
                    res.status(400).json({ success: false, message: 'Division by zero is not allowed' });
                    return;
                }
                operationResponse = param1 / param2;
                break;
            case 'square_root':
                if (param1 < 0) {
                    res.status(400).json({ success: false, message: 'Square root of negative number is not allowed' });
                    return;
                }
                operationResponse = Math.sqrt(param1);
                break;
            case 'random_string':
                const response = await axios.get('https://www.random.org/strings/?num=1&len=10&digits=on&upperalpha=on&loweralpha=on&unique=on&format=plain&rnd=new');
                operationResponse = response.data.trim();
                break;
            default:
                res.status(400).json({ success: false, message: 'Invalid operation type' });
                return;
        }

        user.balance -= operation.cost;
        await user.save();

        const record = new Record({
            operation_id: operation._id,
            user_id,
            user_balance: user.balance,
            operation_response: operationResponse,
        });

        await record.save();
        res.status(201).json({ success: true, data: record });
    } catch (err: any) {
        res.status(400).json({ success: false, message: err.message });
    }
};

export const getUserRecords = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const user_id = req.user?._id;
    const { page = 1, limit = 10, search = '', sort = 'createdAt', order = 'desc' } = req.query;
    const searchRegex = new RegExp(search as string, 'i');

    try {
        const records = await Record.find({ user_id, operation_response: searchRegex, deleted: false })
            .limit(Number(limit))
            .skip((Number(page) - 1) * Number(limit))
            .sort({ [sort as string]: order === 'asc' ? 1 : -1 })
    .populate('operation_id')
            .exec();
        const count = await Record.countDocuments({ user_id, operation_response: searchRegex, deleted: false });

        res.json({
            success: true,
            data: records,
            count: count,
            totalPages: Math.ceil(count / Number(limit)),
            currentPage: Number(page),
        });
    } catch (err: any) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const deleteRecord = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const record = await Record.findById(req.params.id) as IRecord;
        if (!record) {
            res.status(404).json({ success: false, message: 'Record not found' });
            return;
        }

        record.deleted = true;
        await record.save();

        res.json({ success: true, message: 'Record deleted successfully' });
    } catch (err: any) {
        res.status(500).json({ success: false, message: err.message });
    }
};
