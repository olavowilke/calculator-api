const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const recordSchema = new mongoose.Schema({
    _id: {
        type: String,
        default: uuidv4
    },
    operation_id: {
        type: String,
        ref: 'Operation',
        required: true
    },
    user_id: {
        type: String,
        ref: 'User',
        required: true
    },
    amount: {
        type: Number,
        required: true,
        default: 1
    },
    user_balance: {
        type: Number,
        required: true
    },
    operation_response: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    deleted: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

module.exports = mongoose.model('Record', recordSchema);
