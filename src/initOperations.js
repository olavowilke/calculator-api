const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Operation = require('./models/Operation');

dotenv.config();

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(async () => {
    console.log('Connected to MongoDB');

    const operations = [
        {type: 'addition', cost: 1},
        {type: 'subtraction', cost: 1},
        {type: 'multiplication', cost: 2},
        {type: 'division', cost: 2},
        {type: 'square_root', cost: 3},
        {type: 'random_string', cost: 4}
    ];

    try {
        await Operation.insertMany(operations);
        console.log('Operations initialized');
    } catch (err) {
        console.error('Error initializing operations:', err.message);
    } finally {
        mongoose.disconnect();
    }
}).catch(err => {
    console.error('Error connecting to MongoDB:', err.message);
});
