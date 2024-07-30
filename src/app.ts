import express, { NextFunction, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import authRoutes from './routes/auth';
import recordRoutes from './routes/records';
import operationRoutes from './routes/operations';

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());
app.use(morgan('dev'));
app.use(helmet());

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/records', recordRoutes);
app.use('/api/v1/operations', operationRoutes);

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

export default app;
