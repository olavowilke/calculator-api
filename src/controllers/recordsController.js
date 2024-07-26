const Record = require('../models/Record');
const Operation = require('../models/Operation');
const User = require('../models/User');
const axios = require('axios');

exports.createRecord = async (req, res) => {
    const {operationType, param1, param2} = req.body;
    const user_id = req.user._id;

    try {
        const operation = await Operation.findOne({type: operationType});

        const user = await User.findById(user_id);

        if (!operation) {
            return res.status(404).json({success: false, message: 'Operation not found'});
        }

        if (!user) {
            return res.status(404).json({success: false, message: 'User not found'});
        }

        if (user.balance < operation.cost) {
            return res.status(400).json({success: false, message: 'Insufficient balance'});
        }

        let operationResponse;
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
                    return res.status(400).json({success: false, message: 'Division by zero is not allowed'});
                }
                operationResponse = param1 / param2;
                break;
            case 'square_root':
                if (param1 < 0) {
                    return res.status(400).json({
                        success: false,
                        message: 'Square root of negative number is not allowed'
                    });
                }
                operationResponse = Math.sqrt(param1);
                break;
            case 'random_string':
                const response = await axios.get('https://www.random.org/strings/?num=1&len=10&digits=on&upperalpha=on&loweralpha=on&unique=on&format=plain&rnd=new');
                operationResponse = response.data.trim();
                break;
            default:
                return res.status(400).json({success: false, message: 'Invalid operation type'});
        }

        user.balance -= operation.cost;
        await user.save();

        const record = new Record({
            operation_id: operation._id,
            user_id,
            user_balance: user.balance,
            operation_response: operationResponse
        });

        await record.save();
        res.status(201).json({success: true, data: record});

    } catch (err) {
        res.status(400).json({success: false, message: err.message});
    }
};

exports.getUserRecords = async (req, res) => {
    const user_id = req.user._id;
    console.log(user_id)
    const {page = 1, limit = 10, search = '', sort = 'createdAt', order = 'desc'} = req.query;
    const searchRegex = new RegExp(search, 'i');

    try {
        const records = await Record.find({user_id, operation_response: searchRegex, deleted: false})
            .limit(limit)
            .skip((page - 1) * limit)
            .sort({[sort]: order === 'asc' ? 1 : -1})
            .populate('operation_id')
            .exec();
        const count = await Record.countDocuments({user_id, operation_response: searchRegex, deleted: false});

        res.json({
            success: true,
            data: records,
            count: count,
            totalPages: Math.ceil(count / limit),
            currentPage: page
        });
    } catch (err) {
        res.status(500).json({success: false, message: err.message});
    }
};


exports.deleteRecord = async (req, res) => {
    try {
        const record = await Record.findById(req.params.id);
        if (!record) {
            return res.status(404).json({success: false, message: 'Record not found'});
        }

        record.deleted = true;
        await record.save();

        res.json({success: true, message: 'Record deleted successfully'});
    } catch (err) {
        res.status(500).json({success: false, message: err.message});
    }
};
