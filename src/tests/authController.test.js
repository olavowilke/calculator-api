const supertest = require('supertest');
const mongoose = require('mongoose');
const {MongoMemoryServer} = require('mongodb-memory-server');
const app = require('../app'); // Import your Express app
const User = require('../models/User');
const request = supertest(app);

let mongoServer;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri, {useNewUrlParser: true, useUnifiedTopology: true});
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

describe('Auth Controller', () => {
    describe('User Registration', () => {
        it('should register a new user', async () => {
            const response = await request.post('/api/v1/auth/register')
                .send({username: 'testuser', password: 'testpassword'});
            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('User registered successfully');
        });

        it('should return 400 if username is missing', async () => {
            const response = await request.post('/api/v1/auth/register')
                .send({password: 'testpassword'});
            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });

        it('should return 400 if password is missing', async () => {
            const response = await request.post('/api/v1/auth/register')
                .send({username: 'testuser'});
            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });

        it('should return 400 if username is already taken', async () => {
            await request.post('/api/v1/auth/register')
                .send({username: 'testuser', password: 'testpassword'});

            const response = await request.post('/api/v1/auth/register')
                .send({username: 'testuser', password: 'testpassword'});
            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });
    });

    describe('User Login', () => {
        beforeEach(async () => {
            await User.deleteMany({});
            const user = new User({username: 'testuser', password: 'testpassword'});
            await user.save();
        });

        it('should login an existing user', async () => {
            const response = await request.post('/api/v1/auth/login')
                .send({username: 'testuser', password: 'testpassword'});
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body).toHaveProperty('token');
            expect(response.body).toHaveProperty('balance');
        });

        it('should return 404 if username is incorrect', async () => {
            const response = await request.post('/api/v1/auth/login')
                .send({username: 'wronguser', password: 'testpassword'});
            expect(response.status).toBe(404);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('Invalid credentials');
        });

        it('should return 400 if password is incorrect', async () => {
            const response = await request.post('/api/v1/auth/login')
                .send({username: 'testuser', password: 'wrongpassword'});
            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('Invalid credentials');
        });
    });
});
