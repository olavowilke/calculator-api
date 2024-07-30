import supertest, { Response } from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../app';
import Operation, { IOperation } from '../models/Operation';
import Record, { IRecord } from '../models/Record';
import { registerAndLogin } from './authHelper';

let mongoServer: MongoMemoryServer;
let token: string;
let operationId: string;
const request = supertest(app);

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);

    token = await registerAndLogin();

    const operation: IOperation = new Operation({ type: 'addition', cost: 10 });
    await operation.save();
    operationId = operation._id;
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

describe('Records Controller', () => {
    describe('Create Record', () => {
        it('should create a new record', async () => {
            const response: Response = await request.post('/api/v1/records')
                .set('Authorization', token)
                .send({ operationType: 'addition', param1: 5, param2: 3 });
            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('_id');
            expect(response.body.data.operation_response).toBe("8");
        });
    });

    describe('Get User Records', () => {
        it('should get user records with pagination and sorting', async () => {
            const response: Response = await request.get('/api/v1/records?page=1&limit=10&sort=createdAt&order=desc')
                .set('Authorization', token);
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.length).toBeGreaterThanOrEqual(1);
            expect(response.body.totalPages).toBeGreaterThanOrEqual(1);
            expect(response.body.currentPage).toBe(1);
        });

        it('should filter user records by search query', async () => {
            const response: Response = await request.get('/api/v1/records?search=8')
                .set('Authorization', token);
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.length).toBe(1);
        });
    });

    describe('Delete Record', () => {
        it('should soft delete a record', async () => {
            const recordResponse: Response = await request.post('/api/v1/records')
                .set('Authorization', token)
                .send({ operationType: 'addition', param1: 2, param2: 2 });
            const recordId: string = recordResponse.body.data._id;

            const response: Response = await request.delete(`/api/v1/records/${recordId}`)
                .set('Authorization', token);
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('Record deleted successfully');

            const record: IRecord | null = await Record.findById(recordId);
            expect(record?.deleted).toBe(true);
        });

        it('should return 404 if record not found', async () => {
            const response: Response = await request.delete('/api/v1/records/60c72b1f9b1d8a001c8d4567')
                .set('Authorization', token);
            expect(response.status).toBe(404);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('Record not found');
        });
    });
});
