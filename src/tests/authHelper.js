const supertest = require('supertest');
const app = require('../app');

const registerAndLogin = async () => {
    const request = supertest(app);
    const user = {
        username: 'testuser',
        password: 'testpassword'
    };

    await request.post('/api/v1/auth/register').send(user);
    const response = await request.post('/api/v1/auth/login').send(user);

    return response.body.token;
};

module.exports = {registerAndLogin};
