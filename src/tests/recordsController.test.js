// tests/recordsController.test.js
const supertest = require('supertest');
const mongoose = require('mongoose');
const {MongoMemoryServer} = require('mongodb-memory-server');
const app = require('../app'); // Import your Express app
const Operation = require('../models/Operation');
const Record = require('../models/Record');
const {registerAndLogin} = require('../tests/authHelper'); // Import the helper function
const request = supertest(app);

let mongoServer;
let token;
let operationId;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri, {useNewUrlParser: true, useUnifiedTopology: true});

    // Register and login to get the JWT token
    token = await registerAndLogin();

    // Create a test operation
    const operation = new Operation({type: 'addition', cost: 10});
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
            const response = await request.post('/api/v1/records')
                .set('Authorization', token)
                .send({operationType: 'addition', param1: 5, param2: 3});
            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('_id');
            expect(response.body.data.operation_response).toBe("8");
        });
    });

    describe('Get User Records', () => {
        it('should get user records with pagination and sorting', async () => {
            const response = await request.get('/api/v1/records?page=1&limit=10&sort=createdAt&order=desc')
                .set('Authorization', token);
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.length).toBeGreaterThanOrEqual(1);
            expect(response.body.totalPages).toBeGreaterThanOrEqual(1);
            expect(response.body.currentPage).toBe("1");
        });

        it('should filter user records by search query', async () => {
            const response = await request.get('/api/v1/records?search=8')
                .set('Authorization', token);
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.length).toBe(1);
        });
    });

    describe('Delete Record', () => {
        it('should soft delete a record', async () => {
            // Create a new record to delete
            const recordResponse = await request.post('/api/v1/records')
                .set('Authorization', token)
                .send({operationType: 'addition', param1: 2, param2: 2});
            const recordId = recordResponse.body.data._id;

            const response = await request.delete(`/api/v1/records/${recordId}`)
                .set('Authorization', token);
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('Record deleted successfully');

            // Verify that the record is marked as deleted
            const record = await Record.findById(recordId);
            expect(record.deleted).toBe(true);
        });

        it('should return 404 if record not found', async () => {
            const response = await request.delete('/api/v1/records/60c72b1f9b1d8a001c8d4567')
                .set('Authorization', token);
            expect(response.status).toBe(404);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('Record not found');
        });
    });
});
