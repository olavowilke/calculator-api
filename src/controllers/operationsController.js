const Operation = require('../models/Operation');

// Create a new operation
exports.createOperation = async (req, res) => {
    const { type, cost } = req.body;
    try {
        const operation = new Operation({ type, cost });
        await operation.save();
        res.status(201).json({ success: true, data: operation });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// Get all operations with pagination
exports.getOperations = async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    try {
        const operations = await Operation.find()
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();
        const count = await Operation.countDocuments();
        res.json({
            success: true,
            data: operations,
            totalPages: Math.ceil(count / limit),
            currentPage: page
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Get a single operation by ID
exports.getOperationById = async (req, res) => {
    try {
        const operation = await Operation.findById(req.params.id);
        if (!operation) {
            return res.status(404).json({ success: false, message: 'Operation not found' });
        }
        res.json({ success: true, data: operation });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Update an operation
exports.updateOperation = async (req, res) => {
    const { type, cost } = req.body;
    try {
        const operation = await Operation.findByIdAndUpdate(
            req.params.id,
            { type, cost },
            { new: true, runValidators: true }
        );
        if (!operation) {
            return res.status(404).json({ success: false, message: 'Operation not found' });
        }
        res.json({ success: true, data: operation });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// Delete an operation
exports.deleteOperation = async (req, res) => {
    try {
        const operation = await Operation.findByIdAndDelete(req.params.id);
        if (!operation) {
            return res.status(404).json({ success: false, message: 'Operation not found' });
        }
        res.json({ success: true, message: 'Operation deleted successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
