const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const operationSchema = new mongoose.Schema({
    _id: {
        type: String,
        default: uuidv4
    },
    type: {
        type: String,
        required: true,
        enum: ['addition', 'subtraction', 'multiplication', 'division', 'square_root', 'random_string']
    },
    cost: {
        type: Number,
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Operation', operationSchema);
