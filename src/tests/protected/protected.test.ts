import request from 'supertest';
import express from 'express';
import router from '../../routes';
import '../setup';

const app = express();
app.use(express.json());
app.use('/', router);

let token: string;

beforeEach(async () => {
    // Register and login a user to get a JWT
    await request(app)
        .post('/register')
        .send({ email: 'changepass@example.com', password: 'oldpassword123' });

    const res = await request(app)
        .post('/login')
        .send({ email: 'changepass@example.com', password: 'oldpassword123' });

    token = res.body.token;
});

describe('GET /protected', () => {
    it('returns user info if authenticated', async () => {
        const res = await request(app)
            .get('/protected')
            .set('Authorization', `Bearer ${token}`);
        expect(res.status).toBe(200);
        expect(res.body.user.email).toBe('changepass@example.com');
    });

    it('fails if not authenticated', async () => {
        const res = await request(app)
            .get('/protected');
        expect(res.status).toBe(401);
    });

    it('fails with invalid token', async () => {
        const res = await request(app)
            .get('/protected')
            .set('Authorization', 'Bearer invalidtoken');
        expect(res.status).toBe(401);
    });

    it('fails with expired token', async () => {
        // Create an expired token
        const jwt = require('jsonwebtoken');
        const expiredToken = jwt.sign(
            { userId: 1 },
            process.env.JWT_SECRET,
            { expiresIn: -10 } // Expired 10 seconds ago
        );
        const res = await request(app)
            .get('/protected')
            .set('Authorization', `Bearer ${expiredToken}`);
        expect(res.status).toBe(401);
    });

    it('fails with missing Bearer prefix', async () => {
        const res = await request(app)
            .get('/protected')
            .set('Authorization', token); // No "Bearer "
        expect(res.status).toBe(401);
    });
});