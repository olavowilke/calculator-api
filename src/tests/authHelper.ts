import supertest from 'supertest';
import app from '../app';

interface User {
    username: string;
    password: string;
}

export const registerAndLogin = async (): Promise<string> => {
    const request = supertest(app);
    const user: User = {
        username: 'testuser',
        password: 'testpassword'
    };

    await request.post('/api/v1/auth/register').send(user);
    const response = await request.post('/api/v1/auth/login').send(user);

    return response.body.token;
};
