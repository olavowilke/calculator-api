// src/server.ts
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import app from './app';

dotenv.config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI as string);
        console.log('MongoDB connected');
    } catch (err) {
        console.error('MongoDB connection error:', err);
        process.exit(1); // Exit process with failure
    }
};

const startServer = () => {
    const PORT = process.env.PORT ? parseInt(process.env.PORT) : 5000;
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
};

connectDB().then(startServer);
