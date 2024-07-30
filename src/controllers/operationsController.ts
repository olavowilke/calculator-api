import { Request, Response } from 'express';
import Operation from '../models/Operation';

export const createOperation = async (req: Request, res: Response): Promise<void> => {
    const { type, cost } = req.body;
    try {
        const operation = new Operation({ type, cost });
        await operation.save();
        res.status(201).json({ success: true, data: operation });
    } catch (err: any) {
        res.status(400).json({ success: false, message: err.message });
    }
};

export const getOperations = async (req: Request, res: Response): Promise<void> => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    try {
        const operations = await Operation.find()
            .limit(limit)
            .skip((page - 1) * limit)
            .exec();
        const count = await Operation.countDocuments();
        res.json({
            success: true,
            data: operations,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
        });
    } catch (err: any) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const getOperationById = async (req: Request, res: Response): Promise<void> => {
    try {
        const operation = await Operation.findById(req.params.id);
        if (!operation) {
            res.status(404).json({ success: false, message: 'Operation not found' });
            return;
        }
        res.json({ success: true, data: operation });
    } catch (err: any) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const updateOperation = async (req: Request, res: Response): Promise<void> => {
    const { type, cost } = req.body;
    try {
        const operation = await Operation.findByIdAndUpdate(
            req.params.id,
            { type, cost },
            { new: true, runValidators: true }
        );
        if (!operation) {
            res.status(404).json({ success: false, message: 'Operation not found' });
            return;
        }
        res.json({ success: true, data: operation });
    } catch (err: any) {
        res.status(400).json({ success: false, message: err.message });
    }
};

export const deleteOperation = async (req: Request, res: Response): Promise<void> => {
    try {
        const operation = await Operation.findByIdAndDelete(req.params.id);
        if (!operation) {
            res.status(404).json({ success: false, message: 'Operation not found' });
            return;
        }
        res.json({ success: true, message: 'Operation deleted successfully' });
    } catch (err: any) {
        res.status(500).json({ success: false, message: err.message });
    }
};
