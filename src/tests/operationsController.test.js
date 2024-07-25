// tests/operationsController.test.js
const supertest = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../app'); // Import your Express app
const Operation = require('../models/Operation');
const { registerAndLogin } = require('../tests/authHelper'); // Import the helper function
const request = supertest(app);

let mongoServer;
let token;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

    // Register and login to get the JWT token
    token = await registerAndLogin();
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

describe('Operations Controller', () => {
    describe('Create Operation', () => {
        it('should create a new operation', async () => {
            const response = await request.post('/api/v1/operations')
                .set('Authorization', token) // Set the Authorization header
                .send({ type: 'addition', cost: 10 });
            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('_id');
            expect(response.body.data.type).toBe('addition');
            expect(response.body.data.cost).toBe(10);
        });
    });

    describe('Get Operations', () => {
        it('should get all operations with pagination', async () => {
            const response = await request.get('/api/v1/operations?page=1&limit=10')
                .set('Authorization', token); // Set the Authorization header
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.length).toBeGreaterThanOrEqual(1);
            expect(response.body.totalPages).toBeGreaterThanOrEqual(1);
            expect(response.body.currentPage).toBe("1");
        });
    });

    describe('Get Operation by ID', () => {
        it('should get a single operation by ID', async () => {
            const operation = new Operation({ type: 'subtraction', cost: 5 });
            await operation.save();

            const response = await request.get(`/api/v1/operations/${operation._id}`)
                .set('Authorization', token); // Set the Authorization header
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.type).toBe('subtraction');
            expect(response.body.data.cost).toBe(5);
        });

        it('should return 404 if operation not found', async () => {
            const response = await request.get('/api/v1/operations/60c72b1f9b1d8a001c8d4567')
                .set('Authorization', token); // Set the Authorization header
            expect(response.status).toBe(404);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('Operation not found');
        });
    });

    describe('Update Operation', () => {
        it('should update an operation', async () => {
            const operation = new Operation({ type: 'multiplication', cost: 20 });
            await operation.save();

            const response = await request.put(`/api/v1/operations/${operation._id}`)
                .set('Authorization', token) // Set the Authorization header
                .send({ type: 'multiplication', cost: 25 });
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.cost).toBe(25);
        });

        it('should return 404 if operation not found', async () => {
            const response = await request.put('/api/v1/operations/60c72b1f9b1d8a001c8d4567')
                .set('Authorization', token) // Set the Authorization header
                .send({ type: 'multiplication', cost: 25 });
            expect(response.status).toBe(404);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('Operation not found');
        });
    });

    describe('Delete Operation', () => {
        it('should delete an operation', async () => {
            const operation = new Operation({ type: 'division', cost: 30 });
            await operation.save();

            const response = await request.delete(`/api/v1/operations/${operation._id}`)
                .set('Authorization', token); // Set the Authorization header
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('Operation deleted successfully');
        });

        it('should return 404 if operation not found', async () => {
            const response = await request.delete('/api/v1/operations/60c72b1f9b1d8a001c8d4567')
                .set('Authorization', token); // Set the Authorization header
            expect(response.status).toBe(404);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('Operation not found');
        });
    });
});
